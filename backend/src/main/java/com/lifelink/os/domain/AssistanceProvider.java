package com.lifelink.os.domain;

import com.lifelink.os.domain.enums.ProviderType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assistance_providers")
public class AssistanceProvider {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_type", nullable = false)
    private ProviderType providerType;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "rating")
    private Double rating = 4.8;

    @Column(name = "estimated_eta_minutes")
    private Integer estimatedEtaMinutes = 20;

    @Column(name = "service_area")
    private String serviceArea;

    @Column(name = "is_demo", nullable = false)
    private boolean demo = true;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public AssistanceProvider() {
        this.id = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public ProviderType getProviderType() { return providerType; }
    public void setProviderType(ProviderType providerType) { this.providerType = providerType; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getEstimatedEtaMinutes() { return estimatedEtaMinutes; }
    public void setEstimatedEtaMinutes(Integer estimatedEtaMinutes) { this.estimatedEtaMinutes = estimatedEtaMinutes; }

    public String getServiceArea() { return serviceArea; }
    public void setServiceArea(String serviceArea) { this.serviceArea = serviceArea; }

    public boolean isDemo() { return demo; }
    public void setDemo(boolean demo) { this.demo = demo; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
