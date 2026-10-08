package com.lifelink.os.dto.contact;

import jakarta.validation.constraints.NotBlank;

public class CreateEmergencyContactRequest {
    @NotBlank(message = "Contact name is required")
    private String name;

    @NotBlank(message = "Relationship is required")
    private String relationship;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    private String email;
    private boolean primary;
    private boolean notifyOnIncident = true;

    public CreateEmergencyContactRequest() {}

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
}
