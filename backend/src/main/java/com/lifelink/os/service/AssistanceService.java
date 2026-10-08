package com.lifelink.os.service;

import com.lifelink.os.domain.*;
import com.lifelink.os.domain.enums.ActorType;
import com.lifelink.os.domain.enums.IncidentStatus;
import com.lifelink.os.domain.enums.NotificationType;
import com.lifelink.os.domain.enums.ProviderType;
import com.lifelink.os.dto.assistance.AssistanceProviderDto;
import com.lifelink.os.dto.assistance.AssistanceRequestDto;
import com.lifelink.os.dto.assistance.CreateAssistanceRequestDto;
import com.lifelink.os.exception.ResourceNotFoundException;
import com.lifelink.os.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AssistanceService {

    private final AssistanceProviderRepository providerRepository;
    private final AssistanceRequestRepository requestRepository;
    private final IncidentRepository incidentRepository;
    private final IncidentEventRepository incidentEventRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public AssistanceService(
            AssistanceProviderRepository providerRepository,
            AssistanceRequestRepository requestRepository,
            IncidentRepository incidentRepository,
            IncidentEventRepository incidentEventRepository,
            NotificationService notificationService,
            AuditLogService auditLogService) {
        this.providerRepository = providerRepository;
        this.requestRepository = requestRepository;
        this.incidentRepository = incidentRepository;
        this.incidentEventRepository = incidentEventRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<AssistanceProviderDto> getProviders(ProviderType type) {
        List<AssistanceProvider> providers = (type != null) ?
                providerRepository.findByActiveTrueAndProviderType(type) :
                providerRepository.findByActiveTrue();

        return providers.stream()
                .map(AssistanceProviderDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssistanceRequestDto requestAssistance(UUID incidentId, UUID userId, CreateAssistanceRequestDto req) {
        Incident incident = incidentRepository.findByIdAndUserId(incidentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found or unauthorized"));

        AssistanceProvider provider = providerRepository.findById(req.getProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Assistance provider not found"));

        AssistanceRequest assistanceRequest = new AssistanceRequest(incident, provider);
        assistanceRequest.setProviderNotes(req.getNotes());
        AssistanceRequest savedRequest = requestRepository.save(assistanceRequest);

        // Update incident status to DISPATCHED
        if (incident.getStatus() == IncidentStatus.REPORTED || incident.getStatus() == IncidentStatus.ASSESSING) {
            incident.setStatus(IncidentStatus.DISPATCHED);
            incidentRepository.save(incident);
        }

        // Add timeline event
        IncidentEvent event = new IncidentEvent(
                incident,
                "PROVIDER_DISPATCHED",
                ActorType.USER,
                "Assistance Requested: " + provider.getName(),
                "Provider type: " + provider.getProviderType() + " | Estimated ETA: ~" + provider.getEstimatedEtaMinutes() + " mins. Phone: " + provider.getPhoneNumber()
        );
        incidentEventRepository.save(event);

        // Notify user
        notificationService.createNotification(
                userId,
                "Assistance Dispatched",
                provider.getName() + " has been notified for your incident. Estimated ETA: " + provider.getEstimatedEtaMinutes() + " mins.",
                NotificationType.PROVIDER_UPDATE,
                incidentId
        );

        auditLogService.logAction(userId, "ASSISTANCE_REQUESTED", "PROVIDER", provider.getId().toString(), "Requested " + provider.getName() + " for incident " + incidentId, null);

        return AssistanceRequestDto.fromEntity(savedRequest);
    }

    @Transactional(readOnly = true)
    public List<AssistanceRequestDto> getIncidentAssistanceRequests(UUID incidentId, UUID userId) {
        incidentRepository.findByIdAndUserId(incidentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found or unauthorized"));

        return requestRepository.findByIncidentIdOrderByRequestedAtDesc(incidentId)
                .stream()
                .map(AssistanceRequestDto::fromEntity)
                .collect(Collectors.toList());
    }
}
