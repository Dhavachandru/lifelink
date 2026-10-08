package com.lifelink.os.dto.assistance;

import com.lifelink.os.domain.AssistanceProvider;
import com.lifelink.os.domain.enums.ProviderType;
import java.util.UUID;

public class AssistanceProviderDto {
    private UUID id;
    private String name;
    private ProviderType providerType;
    private String phoneNumber;
    private Double rating;
    private Integer estimatedEtaMinutes;
    private String serviceArea;
    private boolean demo;
    private boolean active;

    public AssistanceProviderDto() {}

    public static AssistanceProviderDto fromEntity(AssistanceProvider provider) {
        AssistanceProviderDto dto = new AssistanceProviderDto();
        dto.setId(provider.getId());
        dto.setName(provider.getName());
        dto.setProviderType(provider.getProviderType());
        dto.setPhoneNumber(provider.getPhoneNumber());
        dto.setRating(provider.getRating());
        dto.setEstimatedEtaMinutes(provider.getEstimatedEtaMinutes());
        dto.setServiceArea(provider.getServiceArea());
        dto.setDemo(provider.isDemo());
        dto.setActive(provider.isActive());
        return dto;
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
}
