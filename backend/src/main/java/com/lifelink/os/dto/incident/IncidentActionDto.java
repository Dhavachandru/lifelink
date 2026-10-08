package com.lifelink.os.dto.incident;

import com.lifelink.os.domain.enums.ActionCategory;
import java.time.LocalDateTime;
import java.util.UUID;

public class IncidentActionDto {
    private UUID id;
    private int stepOrder;
    private String title;
    private String description;
    private ActionCategory actionCategory;
    private boolean completed;
    private LocalDateTime updatedAt;

    public IncidentActionDto() {}

    public IncidentActionDto(UUID id, int stepOrder, String title, String description, ActionCategory actionCategory, boolean completed, LocalDateTime updatedAt) {
        this.id = id;
        this.stepOrder = stepOrder;
        this.title = title;
        this.description = description;
        this.actionCategory = actionCategory;
        this.completed = completed;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public int getStepOrder() { return stepOrder; }
    public void setStepOrder(int stepOrder) { this.stepOrder = stepOrder; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ActionCategory getActionCategory() { return actionCategory; }
    public void setActionCategory(ActionCategory actionCategory) { this.actionCategory = actionCategory; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
