package com.lifelink.os.dto.incident;

import com.lifelink.os.domain.Incident;
import com.lifelink.os.domain.enums.IncidentStatus;
import com.lifelink.os.domain.enums.IncidentType;
import com.lifelink.os.domain.enums.UrgencyLevel;
import java.time.LocalDateTime;
import java.util.UUID;

public class IncidentDto {
    private UUID id;
    private UUID userId;
    private UUID vehicleId;
    private String vehicleInfo;
    private IncidentType incidentType;
    private UrgencyLevel urgency;
    private IncidentStatus status;
    private String title;
    private String description;
    private String address;
    private Double latitude;
    private Double longitude;
    private boolean locationSharedExplicitly;
    private String summary;
    private String assistanceNeed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public IncidentDto() {}

    public static IncidentDto fromEntity(Incident incident) {
        IncidentDto dto = new IncidentDto();
        dto.setId(incident.getId());
        dto.setUserId(incident.getUser().getId());
        if (incident.getVehicle() != null) {
            dto.setVehicleId(incident.getVehicle().getId());
            dto.setVehicleInfo(incident.getVehicle().getYear() + " " + incident.getVehicle().getMake() + " " + incident.getVehicle().getModel() + " (" + incident.getVehicle().getLicensePlate() + ")");
        }
        dto.setIncidentType(incident.getIncidentType());
        dto.setUrgency(incident.getUrgency());
        dto.setStatus(incident.getStatus());
        dto.setTitle(incident.getTitle());
        dto.setDescription(incident.getDescription());
        dto.setAddress(incident.getAddress());
        dto.setLatitude(incident.getLatitude());
        dto.setLongitude(incident.getLongitude());
        dto.setLocationSharedExplicitly(incident.isLocationSharedExplicitly());
        dto.setSummary(incident.getSummary());
        dto.setAssistanceNeed(incident.getAssistanceNeed());
        dto.setCreatedAt(incident.getCreatedAt());
        dto.setUpdatedAt(incident.getUpdatedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getVehicleId() { return vehicleId; }
    public void setVehicleId(UUID vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleInfo() { return vehicleInfo; }
    public void setVehicleInfo(String vehicleInfo) { this.vehicleInfo = vehicleInfo; }

    public IncidentType getIncidentType() { return incidentType; }
    public void setIncidentType(IncidentType incidentType) { this.incidentType = incidentType; }

    public UrgencyLevel getUrgency() { return urgency; }
    public void setUrgency(UrgencyLevel urgency) { this.urgency = urgency; }

    public IncidentStatus getStatus() { return status; }
    public void setStatus(IncidentStatus status) { this.status = status; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public boolean isLocationSharedExplicitly() { return locationSharedExplicitly; }
    public void setLocationSharedExplicitly(boolean locationSharedExplicitly) { this.locationSharedExplicitly = locationSharedExplicitly; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getAssistanceNeed() { return assistanceNeed; }
    public void setAssistanceNeed(String assistanceNeed) { this.assistanceNeed = assistanceNeed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
