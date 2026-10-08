package com.lifelink.os.dto.ai;

import com.lifelink.os.domain.enums.IncidentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class IncidentAssessmentRequest {
    @NotNull(message = "Incident type is required")
    private IncidentType incidentType;

    @NotBlank(message = "Description is required")
    private String description;

    private List<String> symptoms;
    private String vehicleDetails;
    private boolean injuriesReported;
    private boolean onActiveRoadway;
    private String locationDescription;

    public IncidentAssessmentRequest() {}

    public IncidentType getIncidentType() { return incidentType; }
    public void setIncidentType(IncidentType incidentType) { this.incidentType = incidentType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getSymptoms() { return symptoms; }
    public void setSymptoms(List<String> symptoms) { this.symptoms = symptoms; }

    public String getVehicleDetails() { return vehicleDetails; }
    public void setVehicleDetails(String vehicleDetails) { this.vehicleDetails = vehicleDetails; }

    public boolean isInjuriesReported() { return injuriesReported; }
    public void setInjuriesReported(boolean injuriesReported) { this.injuriesReported = injuriesReported; }

    public boolean isOnActiveRoadway() { return onActiveRoadway; }
    public void setOnActiveRoadway(boolean onActiveRoadway) { this.onActiveRoadway = onActiveRoadway; }

    public String getLocationDescription() { return locationDescription; }
    public void setLocationDescription(String locationDescription) { this.locationDescription = locationDescription; }
}
