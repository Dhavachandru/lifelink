package com.lifelink.os.dto.contact;

import com.lifelink.os.domain.EmergencyContact;
import java.time.LocalDateTime;
import java.util.UUID;

public class EmergencyContactDto {
    private UUID id;
    private UUID userId;
    private String name;
    private String relationship;
    private String phoneNumber;
    private String email;
    private boolean primary;
    private boolean notifyOnIncident;
    private LocalDateTime createdAt;

    public EmergencyContactDto() {}

    public static EmergencyContactDto fromEntity(EmergencyContact contact) {
        EmergencyContactDto dto = new EmergencyContactDto();
        dto.setId(contact.getId());
        dto.setUserId(contact.getUser().getId());
        dto.setName(contact.getName());
        dto.setRelationship(contact.getRelationship());
        dto.setPhoneNumber(contact.getPhoneNumber());
        dto.setEmail(contact.getEmail());
        dto.setPrimary(contact.isPrimary());
        dto.setNotifyOnIncident(contact.isNotifyOnIncident());
        dto.setCreatedAt(contact.getCreatedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean isPrimary() { return primary; }
    public void setPrimary(boolean primary) { this.primary = primary; }

    public boolean isNotifyOnIncident() { return notifyOnIncident; }
    public void setNotifyOnIncident(boolean notifyOnIncident) { this.notifyOnIncident = notifyOnIncident; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
