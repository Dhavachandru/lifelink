package com.lifelink.os.dto.incident;

import com.lifelink.os.domain.enums.IncidentType;
import com.lifelink.os.domain.enums.UrgencyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public class CreateIncidentRequest {
    private UUID vehicleId;

    @NotNull(message = "Incident type is required")
    private IncidentType incidentType;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private UrgencyLevel urgency;
    private String address;
    private Double latitude;
    private Double longitude;
    private boolean locationSharedExplicitly = false;
    private List<String> symptoms;
    private boolean injuriesReported = false;
    private boolean onActiveRoadway = false;

    public CreateIncidentRequest() {}

    public UUID getVehicleId() { return vehicleId; }
    public void setVehicleId(UUID vehicleId) { this.vehicleId = vehicleId; }

    public IncidentType getIncidentType() { return incidentType; }
    public void setIncidentType(IncidentType incidentType) { this.incidentType = incidentType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public UrgencyLevel getUrgency() { return urgency; }
    public void setUrgency(UrgencyLevel urgency) { this.urgency = urgency; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public boolean isLocationSharedExplicitly() { return locationSharedExplicitly; }
    public void setLocationSharedExplicitly(boolean locationSharedExplicitly) { this.locationSharedExplicitly = locationSharedExplicitly; }

    public List<String> getSymptoms() { return symptoms; }
    public void setSymptoms(List<String> symptoms) { this.symptoms = symptoms; }

    public boolean isInjuriesReported() { return injuriesReported; }
    public void setInjuriesReported(boolean injuriesReported) { this.injuriesReported = injuriesReported; }

    public boolean isOnActiveRoadway() { return onActiveRoadway; }
    public void setOnActiveRoadway(boolean onActiveRoadway) { this.onActiveRoadway = onActiveRoadway; }
}
