package com.lifelink.os.dto.assistance;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CreateAssistanceRequestDto {
    @NotNull(message = "Provider ID is required")
    private UUID providerId;

    private String notes;

    public CreateAssistanceRequestDto() {}

    public UUID getProviderId() { return providerId; }
    public void setProviderId(UUID providerId) { this.providerId = providerId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
