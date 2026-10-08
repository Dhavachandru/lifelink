package com.lifelink.os.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifelink.os.domain.*;
import com.lifelink.os.domain.enums.*;
import com.lifelink.os.dto.ai.IncidentAssessmentRequest;
import com.lifelink.os.dto.ai.IncidentAssessmentResponse;
import com.lifelink.os.dto.incident.*;
import com.lifelink.os.exception.BadRequestException;
import com.lifelink.os.exception.ResourceNotFoundException;
import com.lifelink.os.repository.*;
import com.lifelink.os.service.ai.AiAssessmentService;
import com.lifelink.os.service.storage.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    private static final Logger log = LoggerFactory.getLogger(IncidentService.class);

    private final IncidentRepository incidentRepository;
    private final IncidentEventRepository incidentEventRepository;
    private final IncidentActionRepository incidentActionRepository;
    private final IncidentAttachmentRepository incidentAttachmentRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final AiAssessmentService aiAssessmentService;
    private final StorageService storageService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    public IncidentService(
            IncidentRepository incidentRepository,
            IncidentEventRepository incidentEventRepository,
            IncidentActionRepository incidentActionRepository,
            IncidentAttachmentRepository incidentAttachmentRepository,
            VehicleRepository vehicleRepository,
            UserRepository userRepository,
            AiAssessmentService aiAssessmentService,
            StorageService storageService,
            NotificationService notificationService,
            AuditLogService auditLogService,
            ObjectMapper objectMapper) {
        this.incidentRepository = incidentRepository;
        this.incidentEventRepository = incidentEventRepository;
        this.incidentActionRepository = incidentActionRepository;
        this.incidentAttachmentRepository = incidentAttachmentRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.aiAssessmentService = aiAssessmentService;
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<IncidentDto> getUserIncidents(UUID userId) {
        return incidentRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(IncidentDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IncidentDetailDto getIncidentDetail(UUID incidentId, UUID userId) {
        Incident incident = incidentRepository.findByIdAndUserId(incidentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found or unauthorized"));

        IncidentDetailDto detail = IncidentDetailDto.fromEntity(incident);

        // Load action checklist
        List<IncidentActionDto> actions = incidentActionRepository.findByIncidentIdOrderByStepOrderAsc(incidentId)
                .stream()
                .map(a -> new IncidentActionDto(a.getId(), a.getStepOrder(), a.getTitle(), a.getDescription(), a.getActionCategory(), a.isCompleted(), a.getUpdatedAt()))
                .collect(Collectors.toList());
        detail.setActions(actions);

        // Load timeline events
        List<IncidentEventDto> events = incidentEventRepository.findByIncidentIdOrderByCreatedAtAsc(incidentId)
                .stream()
                .map(e -> new IncidentEventDto(e.getId(), e.getEventType(), e.getActorType(), e.getTitle(), e.getDescription(), e.getCreatedAt()))
                .collect(Collectors.toList());
        detail.setEvents(events);

        // Load attachments
        List<IncidentAttachmentDto> attachments = incidentAttachmentRepository.findByIncidentIdOrderByCreatedAtDesc(incidentId)
                .stream()
                .map(att -> {
                    IncidentAttachmentDto dto = new IncidentAttachmentDto();
                    dto.setId(att.getId());
                    dto.setFileName(att.getFileName());
                    dto.setFileSize(att.getFileSize());
                    dto.setContentType(att.getContentType());
                    dto.setAttachmentType(att.getAttachmentType());
                    dto.setNotes(att.getNotes());
                    dto.setCreatedAt(att.getCreatedAt());
                    dto.setDownloadUrl("/api/incidents/" + incidentId + "/attachments/" + att.getId());
                    return dto;
                })
                .collect(Collectors.toList());
        detail.setAttachments(attachments);

        return detail;
    }

    @Transactional
    public IncidentDetailDto createIncident(CreateIncidentRequest req, UUID userId, String ip) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Vehicle vehicle = null;
        if (req.getVehicleId() != null) {
            vehicle = vehicleRepository.findByIdAndUserId(req.getVehicleId(), userId).orElse(null);
        }

        Incident incident = new Incident();
        incident.setUser(user);
        incident.setVehicle(vehicle);
        incident.setIncidentType(req.getIncidentType());
        incident.setTitle(req.getTitle().trim());
        incident.setDescription(req.getDescription().trim());
        incident.setAddress(req.getAddress());

        // Privacy and safety: explicitly track whether location was shared with user permission
        if (req.isLocationSharedExplicitly() && req.getLatitude() != null && req.getLongitude() != null) {
            incident.setLatitude(req.getLatitude());
            incident.setLongitude(req.getLongitude());
            incident.setLocationSharedExplicitly(true);
        } else {
            incident.setLocationSharedExplicitly(false);
        }

        incident.setStatus(IncidentStatus.ASSESSING);

        Incident savedIncident = incidentRepository.save(incident);

        // Record creation event in timeline
        IncidentEvent createdEvent = new IncidentEvent(
                savedIncident,
                "CREATED",
                ActorType.USER,
                "Incident Reported",
                "Incident created under category: " + req.getIncidentType() +
                        (incident.isLocationSharedExplicitly() ? " with explicit GPS coordinates." : " without GPS coordinates.")
        );
        incidentEventRepository.save(createdEvent);

        // Perform AI assessment with deterministic fallback
        IncidentAssessmentRequest aiReq = new IncidentAssessmentRequest();
        aiReq.setIncidentType(req.getIncidentType());
        aiReq.setDescription(req.getDescription());
        aiReq.setSymptoms(req.getSymptoms());
        aiReq.setInjuriesReported(req.isInjuriesReported());
        aiReq.setOnActiveRoadway(req.isOnActiveRoadway());
        aiReq.setLocationDescription(req.getAddress());
        if (vehicle != null) {
            aiReq.setVehicleDetails(vehicle.getYear() + " " + vehicle.getMake() + " " + vehicle.getModel());
        }

        IncidentAssessmentResponse assessment = aiAssessmentService.assessIncident(aiReq);

        // Update incident with assessment
        savedIncident.setUrgency(assessment.getUrgency());
        savedIncident.setSummary(assessment.getSummary());
        savedIncident.setAssistanceNeed(assessment.getAssistanceNeed());
        try {
            savedIncident.setAiAssessmentJson(objectMapper.writeValueAsString(assessment));
        } catch (Exception e) {
            log.warn("Failed to serialize assessment json", e);
        }
        savedIncident.setStatus(IncidentStatus.REPORTED);
        incidentRepository.save(savedIncident);

        // Generate Incident Actions (Checklist steps)
        int stepOrder = 1;
        for (String step : assessment.getImmediateSafetySteps()) {
            incidentActionRepository.save(new IncidentAction(savedIncident, stepOrder++, step, "Immediate safety requirement", ActionCategory.IMMEDIATE_SAFETY));
        }
        for (String step : assessment.getRecommendedActions()) {
            incidentActionRepository.save(new IncidentAction(savedIncident, stepOrder++, step, "Recommended response procedure", ActionCategory.RECOMMENDED_ACTION));
        }
        for (String step : assessment.getEvidenceToCollect()) {
            incidentActionRepository.save(new IncidentAction(savedIncident, stepOrder++, step, "Capture evidence only when completely safe", ActionCategory.EVIDENCE_COLLECTION));
        }
        for (String step : assessment.getDocumentsToCheck()) {
            incidentActionRepository.save(new IncidentAction(savedIncident, stepOrder++, step, "Verify document coverage in your vault", ActionCategory.DOCUMENT_CHECK));
        }

        // Record assessment event in timeline
        IncidentEvent assessedEvent = new IncidentEvent(
                savedIncident,
                "ASSESSED",
                ActorType.AI,
                "AI Assessment Completed (" + assessment.getEvaluatedBy() + ")",
                "Triage urgency evaluated as " + assessment.getUrgency() + ". Recommended assistance: " + assessment.getAssistanceNeed() + "."
        );
        incidentEventRepository.save(assessedEvent);

        // Notify user
        notificationService.createNotification(
                userId,
                "Incident Triage Ready",
                "Urgency: " + assessment.getUrgency() + " - " + assessment.getSummary(),
                NotificationType.INCIDENT_ALERT,
                savedIncident.getId()
        );

        auditLogService.logAction(userId, "INCIDENT_REPORTED", "INCIDENT", savedIncident.getId().toString(), "Reported " + req.getIncidentType(), ip);

        return getIncidentDetail(savedIncident.getId(), userId);
    }

    @Transactional
    public IncidentDetailDto updateStatus(UUID incidentId, UUID userId, UpdateIncidentStatusRequest req) {
        Incident incident = incidentRepository.findByIdAndUserId(incidentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found or unauthorized"));

        IncidentStatus oldStatus = incident.getStatus();
        incident.setStatus(req.getStatus());

        if (req.getStatus() == IncidentStatus.RESOLVED) {
            incident.setResolvedAt(LocalDateTime.now());
            if (req.getResolutionNotes() != null) {
                incident.setResolutionNotes(req.getResolutionNotes().trim());
            }
        }

        Incident saved = incidentRepository.save(incident);

        IncidentEvent event = new IncidentEvent(
                saved,
                "STATUS_CHANGED",
                ActorType.USER,
                "Status Changed: " + oldStatus + " -> " + req.getStatus(),
                req.getResolutionNotes() != null ? req.getResolutionNotes() : "Status updated by user."
        );
        incidentEventRepository.save(event);

        auditLogService.logAction(userId, "INCIDENT_STATUS_UPDATED", "INCIDENT", incidentId.toString(), "Status: " + req.getStatus(), null);
        return getIncidentDetail(incidentId, userId);
    }

    @Transactional
    public IncidentDetailDto addNote(UUID incidentId, UUID userId, AddIncidentNoteRequest req) {
        Incident incident = incidentRepository.findByIdAndUserId(incidentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found or unauthorized"));

        IncidentEvent event = new IncidentEvent(
                incident,
                "NOTE_ADDED",
                ActorType.USER,
                req.getTitle(),
                req.getDescription()
        );
        incidentEventRepository.save(event);

        auditLogService.logAction(userId, "INCIDENT_NOTE_ADDED", "INCIDENT", incidentId.toString(), "Added note: " + req.getTitle(), null);
        return getIncidentDetail(incidentId, userId);
    }

    @Transactional
    public void toggleActionStep(UUID actionId, UUID incidentId, UUID userId) {
        incidentRepository.findByIdAndUserId(incidentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found or unauthorized"));

        IncidentAction action = incidentActionRepository.findById(actionId)
                .orElseThrow(() -> new ResourceNotFoundException("Action step not found"));

        if (!action.getIncident().getId().equals(incidentId)) {
            throw new BadRequestException("Action step does not belong to this incident");
        }

        action.setCompleted(!action.isCompleted());
        incidentActionRepository.save(action);
    }

    @Transactional
    public IncidentAttachmentDto uploadAttachment(
            UUID incidentId, UUID userId, MultipartFile file, String attachmentType, String notes) {
        Incident incident = incidentRepository.findByIdAndUserId(incidentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found or unauthorized"));

        if (file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }

        try {
            String fileKey = storageService.storeFile(file.getBytes(), file.getOriginalFilename(), file.getContentType());
            IncidentAttachment att = new IncidentAttachment();
            att.setIncident(incident);
            att.setFileKey(fileKey);
            att.setFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment.jpg");
            att.setFileSize(file.getSize());
            att.setContentType(file.getContentType() != null ? file.getContentType() : "image/jpeg");
            att.setAttachmentType(attachmentType != null ? attachmentType : "PHOTO");
            att.setNotes(notes);

            IncidentAttachment saved = incidentAttachmentRepository.save(att);

            // Record timeline event
            IncidentEvent event = new IncidentEvent(
                    incident,
                    "ATTACHMENT_ADDED",
                    ActorType.USER,
                    "Attached Evidence: " + saved.getFileName(),
                    notes != null ? notes : "Evidence uploaded."
            );
            incidentEventRepository.save(event);

            auditLogService.logAction(userId, "ATTACHMENT_UPLOADED", "ATTACHMENT", saved.getId().toString(), "Added attachment to incident " + incidentId, null);

            IncidentAttachmentDto dto = new IncidentAttachmentDto();
            dto.setId(saved.getId());
            dto.setFileName(saved.getFileName());
            dto.setFileSize(saved.getFileSize());
            dto.setContentType(saved.getContentType());
            dto.setAttachmentType(saved.getAttachmentType());
            dto.setNotes(saved.getNotes());
            dto.setCreatedAt(saved.getCreatedAt());
            dto.setDownloadUrl("/api/incidents/" + incidentId + "/attachments/" + saved.getId());
            return dto;
        } catch (IOException e) {
            throw new RuntimeException("Could not save attachment", e);
        }
    }

    @Transactional(readOnly = true)
    public byte[] downloadAttachment(UUID incidentId, UUID attachmentId, UUID userId) {
        incidentRepository.findByIdAndUserId(incidentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found or unauthorized"));

        IncidentAttachment att = incidentAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        if (!att.getIncident().getId().equals(incidentId)) {
            throw new BadRequestException("Attachment does not belong to specified incident");
        }

        return storageService.loadFile(att.getFileKey());
    }
}
