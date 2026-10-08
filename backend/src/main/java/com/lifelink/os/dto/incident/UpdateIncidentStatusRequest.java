package com.lifelink.os.dto.incident;

import com.lifelink.os.domain.enums.IncidentStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateIncidentStatusRequest {
    @NotNull(message = "Status is required")
    private IncidentStatus status;
    private String resolutionNotes;

    public UpdateIncidentStatusRequest() {}

    public IncidentStatus getStatus() { return status; }
    public void setStatus(IncidentStatus status) { this.status = status; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
