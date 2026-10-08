package com.lifelink.os.dto.assistance;

import com.lifelink.os.domain.AssistanceRequest;
import java.time.LocalDateTime;
import java.util.UUID;

public class AssistanceRequestDto {
    private UUID id;
    private UUID incidentId;
    private AssistanceProviderDto provider;
    private String status;
    private LocalDateTime requestedAt;
    private LocalDateTime confirmedAt;
    private String providerNotes;

    public AssistanceRequestDto() {}

    public static AssistanceRequestDto fromEntity(AssistanceRequest req) {
        AssistanceRequestDto dto = new AssistanceRequestDto();
        dto.setId(req.getId());
        dto.setIncidentId(req.getIncident().getId());
        if (req.getProvider() != null) {
            dto.setProvider(AssistanceProviderDto.fromEntity(req.getProvider()));
        }
        dto.setStatus(req.getStatus());
        dto.setRequestedAt(req.getRequestedAt());
        dto.setConfirmedAt(req.getConfirmedAt());
        dto.setProviderNotes(req.getProviderNotes());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getIncidentId() { return incidentId; }
    public void setIncidentId(UUID incidentId) { this.incidentId = incidentId; }

    public AssistanceProviderDto getProvider() { return provider; }
    public void setProvider(AssistanceProviderDto provider) { this.provider = provider; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }

    public String getProviderNotes() { return providerNotes; }
    public void setProviderNotes(String providerNotes) { this.providerNotes = providerNotes; }
}
