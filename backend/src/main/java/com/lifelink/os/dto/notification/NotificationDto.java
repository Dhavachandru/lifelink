package com.lifelink.os.dto.notification;

import com.lifelink.os.domain.Notification;
import com.lifelink.os.domain.enums.NotificationType;
import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationDto {
    private UUID id;
    private String title;
    private String message;
    private NotificationType notificationType;
    private boolean read;
    private UUID incidentId;
    private LocalDateTime createdAt;

    public NotificationDto() {}

    public static NotificationDto fromEntity(Notification n) {
        NotificationDto dto = new NotificationDto();
        dto.setId(n.getId());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setNotificationType(n.getNotificationType());
        dto.setRead(n.isRead());
        dto.setIncidentId(n.getIncidentId());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getNotificationType() { return notificationType; }
    public void setNotificationType(NotificationType notificationType) { this.notificationType = notificationType; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public UUID getIncidentId() { return incidentId; }
    public void setIncidentId(UUID incidentId) { this.incidentId = incidentId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
