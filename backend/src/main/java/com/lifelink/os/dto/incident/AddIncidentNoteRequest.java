package com.lifelink.os.dto.incident;

import jakarta.validation.constraints.NotBlank;

public class AddIncidentNoteRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    public AddIncidentNoteRequest() {}
    public AddIncidentNoteRequest(String title, String description) {
        this.title = title;
        this.description = description;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
