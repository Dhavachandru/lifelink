package com.lifelink.os.service;

import com.lifelink.os.domain.*;
import com.lifelink.os.dto.assistance.AssistanceRequestDto;
import com.lifelink.os.dto.auth.UserDto;
import com.lifelink.os.dto.contact.EmergencyContactDto;
import com.lifelink.os.dto.incident.IncidentActionDto;
import com.lifelink.os.dto.incident.IncidentAttachmentDto;
import com.lifelink.os.dto.incident.IncidentDto;
import com.lifelink.os.dto.incident.IncidentEventDto;
import com.lifelink.os.dto.notification.NotificationDto;
import com.lifelink.os.dto.settings.UserSettingsDto;
import com.lifelink.os.dto.vehicle.VehicleDocumentDto;
import com.lifelink.os.dto.vehicle.VehicleDto;
import com.lifelink.os.dto.vehicle.VehicleServiceRecordDto;
import com.lifelink.os.exception.ResourceNotFoundException;
import com.lifelink.os.repository.*;
import com.lifelink.os.service.storage.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final UserSettingsRepository settingsRepository;
    private final EmergencyContactRepository contactRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleDocumentRepository vehicleDocumentRepository;
    private final VehicleServiceRecordRepository vehicleServiceRecordRepository;
    private final IncidentRepository incidentRepository;
    private final IncidentActionRepository incidentActionRepository;
    private final IncidentEventRepository incidentEventRepository;
    private final IncidentAttachmentRepository incidentAttachmentRepository;
    private final AssistanceRequestRepository assistanceRequestRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final StorageService storageService;
    private final AuditLogService auditLogService;

    public UserService(
            UserRepository userRepository,
            UserSettingsRepository settingsRepository,
            EmergencyContactRepository contactRepository,
            VehicleRepository vehicleRepository,
            VehicleDocumentRepository vehicleDocumentRepository,
            VehicleServiceRecordRepository vehicleServiceRecordRepository,
            IncidentRepository incidentRepository,
            IncidentActionRepository incidentActionRepository,
            IncidentEventRepository incidentEventRepository,
            IncidentAttachmentRepository incidentAttachmentRepository,
            AssistanceRequestRepository assistanceRequestRepository,
            NotificationRepository notificationRepository,
            AuditLogRepository auditLogRepository,
            RefreshTokenRepository refreshTokenRepository,
            StorageService storageService,
            AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.settingsRepository = settingsRepository;
        this.contactRepository = contactRepository;
        this.vehicleRepository = vehicleRepository;
        this.vehicleDocumentRepository = vehicleDocumentRepository;
        this.vehicleServiceRecordRepository = vehicleServiceRecordRepository;
        this.incidentRepository = incidentRepository;
        this.incidentActionRepository = incidentActionRepository;
        this.incidentEventRepository = incidentEventRepository;
        this.incidentAttachmentRepository = incidentAttachmentRepository;
        this.assistanceRequestRepository = assistanceRequestRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.storageService = storageService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto updateProfile(UUID userId, String fullName, String phoneNumber) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (fullName != null && !fullName.isBlank()) {
            user.setFullName(fullName.trim());
        }
        if (phoneNumber != null) {
            user.setPhoneNumber(phoneNumber.trim());
        }

        User updated = userRepository.save(user);
        auditLogService.logAction(userId, "PROFILE_UPDATED", "USER", userId.toString(), "Profile details updated", null);
        return UserDto.fromEntity(updated);
    }

    /**
     * User-controlled GDPR data export.
     * Compiles an owner-scoped JSON archive of all profile data, vehicles, document metadata,
     * emergency contacts, incidents, timelines, and notification preferences.
     * Sensitive internal storage keys and password hashes are strictly excluded.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> exportUserData(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> exportData = new LinkedHashMap<>();
        exportData.put("formatVersion", "LIFELINK_OS_GDPR_EXPORT_1.0");
        exportData.put("exportTimestamp", LocalDateTime.now().toString());
        exportData.put("description", "Complete owner-scoped archive of user data, vehicles, incidents, assistance requests, and preferences.");

        // Profile (NO passwords or secrets)
        exportData.put("profile", UserDto.fromEntity(user));

        // Settings & notification preferences
        UserSettingsDto settings = settingsRepository.findByUserId(userId)
                .map(UserSettingsDto::fromEntity)
                .orElse(null);
        exportData.put("settings", settings);

        // Emergency Contacts
        List<EmergencyContactDto> contacts = contactRepository.findByUserIdOrderByIsPrimaryDescCreatedAtAsc(userId)
                .stream().map(EmergencyContactDto::fromEntity).collect(Collectors.toList());
        exportData.put("emergencyContacts", contacts);

        // Vehicles, documents metadata, and service logs
        List<Vehicle> vehicles = vehicleRepository.findByUserIdOrderByIsPrimaryDescCreatedAtDesc(userId);
        List<Map<String, Object>> vehiclesExport = vehicles.stream().map(v -> {
            Map<String, Object> vMap = new LinkedHashMap<>();
            vMap.put("vehicle", VehicleDto.fromEntity(v));

            // Document metadata only (file content & sensitive file paths excluded)
            List<VehicleDocumentDto> docs = vehicleDocumentRepository.findByVehicleIdOrderByCreatedAtDesc(v.getId())
                    .stream().map(VehicleDocumentDto::fromEntity).collect(Collectors.toList());
            vMap.put("documents", docs);

            List<VehicleServiceRecordDto> services = vehicleServiceRecordRepository.findByVehicleIdOrderByServiceDateDesc(v.getId())
                    .stream().map(VehicleServiceRecordDto::fromEntity).collect(Collectors.toList());
            vMap.put("serviceRecords", services);
            return vMap;
        }).collect(Collectors.toList());
        exportData.put("vehicles", vehiclesExport);

        // Incidents, timelines, action checklist, and attachments metadata
        List<Incident> incidents = incidentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> incidentsExport = incidents.stream().map(inc -> {
            Map<String, Object> incMap = new LinkedHashMap<>();
            incMap.put("incident", IncidentDto.fromEntity(inc));

            List<IncidentActionDto> actions = incidentActionRepository.findByIncidentIdOrderByStepOrderAsc(inc.getId())
                    .stream().map(a -> new IncidentActionDto(a.getId(), a.getStepOrder(), a.getTitle(), a.getDescription(), a.getActionCategory(), a.isCompleted(), a.getUpdatedAt()))
                    .collect(Collectors.toList());
            incMap.put("actions", actions);

            List<IncidentEventDto> events = incidentEventRepository.findByIncidentIdOrderByCreatedAtAsc(inc.getId())
                    .stream().map(e -> new IncidentEventDto(e.getId(), e.getEventType(), e.getActorType(), e.getTitle(), e.getDescription(), e.getCreatedAt()))
                    .collect(Collectors.toList());
            incMap.put("timelineEvents", events);

            List<IncidentAttachmentDto> attachments = incidentAttachmentRepository.findByIncidentIdOrderByCreatedAtDesc(inc.getId())
                    .stream().map(att -> {
                        IncidentAttachmentDto dto = new IncidentAttachmentDto();
                        dto.setId(att.getId());
                        dto.setFileName(att.getFileName());
                        dto.setFileSize(att.getFileSize());
                        dto.setContentType(att.getContentType());
                        dto.setAttachmentType(att.getAttachmentType());
                        dto.setNotes(att.getNotes());
                        dto.setCreatedAt(att.getCreatedAt());
                        return dto;
                    }).collect(Collectors.toList());
            incMap.put("attachments", attachments);

            List<AssistanceRequestDto> assistance = assistanceRequestRepository.findByIncidentIdOrderByRequestedAtDesc(inc.getId())
                    .stream().map(AssistanceRequestDto::fromEntity).collect(Collectors.toList());
            incMap.put("assistanceRequests", assistance);

            return incMap;
        }).collect(Collectors.toList());
        exportData.put("incidents", incidentsExport);

        // Notifications
        List<NotificationDto> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(NotificationDto::fromEntity).collect(Collectors.toList());
        exportData.put("notifications", notifications);

        // Audit log summary
        List<AuditLog> auditLogs = auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
        exportData.put("auditLogSummary", auditLogs.stream().map(a -> Map.of(
                "action", a.getAction(),
                "resourceType", a.getResourceType(),
                "timestamp", a.getCreatedAt().toString()
        )).collect(Collectors.toList()));

        auditLogService.logAction(userId, "DATA_EXPORT_REQUESTED", "USER", userId.toString(), "User exported full data archive", null);
        return exportData;
    }

    /**
     * User-controlled permanent account and data deletion request.
     * Purges all owner-scoped vehicles, documents from storage, incidents,
     * attachments from storage, refresh tokens, settings, contacts, and profile.
     */
    @Transactional
    public void deleteUserAccount(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 1. Purge vehicle documents from storage abstraction
        List<Vehicle> vehicles = vehicleRepository.findByUserIdOrderByIsPrimaryDescCreatedAtDesc(userId);
        for (Vehicle v : vehicles) {
            List<VehicleDocument> docs = vehicleDocumentRepository.findByVehicleIdOrderByCreatedAtDesc(v.getId());
            for (VehicleDocument doc : docs) {
                try {
                    storageService.deleteFile(doc.getFileKey());
                } catch (Exception e) {
                    log.warn("Could not delete vehicle document file key during account purge: {}", doc.getFileKey(), e);
                }
            }
        }

        // 2. Purge incident attachments from storage abstraction
        List<Incident> incidents = incidentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Incident inc : incidents) {
            List<IncidentAttachment> attachments = incidentAttachmentRepository.findByIncidentIdOrderByCreatedAtDesc(inc.getId());
            for (IncidentAttachment att : attachments) {
                try {
                    storageService.deleteFile(att.getFileKey());
                } catch (Exception e) {
                    log.warn("Could not delete incident attachment file key during account purge: {}", att.getFileKey(), e);
                }
            }
        }

        // 3. Purge active refresh tokens
        refreshTokenRepository.deleteByUserId(userId);

        // 4. Delete user entity (cascade constraints clean related relational records)
        userRepository.delete(user);

        log.info("Successfully completed permanent account deletion request for user id: {}", userId);
    }
}
