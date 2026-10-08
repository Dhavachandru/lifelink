package com.lifelink.os.dto.incident;

import com.lifelink.os.domain.enums.ActorType;
import java.time.LocalDateTime;
import java.util.UUID;

public class IncidentEventDto {
    private UUID id;
    private String eventType;
    private ActorType actorType;
    private String title;
    private String description;
    private LocalDateTime createdAt;

    public IncidentEventDto() {}

    public IncidentEventDto(UUID id, String eventType, ActorType actorType, String title, String description, LocalDateTime createdAt) {
        this.id = id;
        this.eventType = eventType;
        this.actorType = actorType;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public ActorType getActorType() { return actorType; }
    public void setActorType(ActorType actorType) { this.actorType = actorType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
