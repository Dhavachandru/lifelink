package com.lifelink.os.dto.vehicle;

import com.lifelink.os.domain.Vehicle;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class VehicleDto {
    private UUID id;
    private UUID userId;
    private String make;
    private String model;
    private int year;
    private String licensePlate;
    private String vin;
    private String color;
    private String fuelType;
    private String insurancePolicyNumber;
    private String insuranceProvider;
    private LocalDate insuranceExpiryDate;
    private LocalDate pucExpiryDate;
    private LocalDate warrantyExpiryDate;
    private boolean primary;
    private boolean isDemo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VehicleDto() {}

    public static VehicleDto fromEntity(Vehicle vehicle) {
        VehicleDto dto = new VehicleDto();
        dto.setId(vehicle.getId());
        dto.setUserId(vehicle.getUser().getId());
        dto.setMake(vehicle.getMake());
        dto.setModel(vehicle.getModel());
        dto.setYear(vehicle.getYear());
        dto.setLicensePlate(vehicle.getLicensePlate());
        dto.setVin(vehicle.getVin());
        dto.setColor(vehicle.getColor());
        dto.setFuelType(vehicle.getFuelType());
        dto.setInsurancePolicyNumber(vehicle.getInsurancePolicyNumber());
        dto.setInsuranceProvider(vehicle.getInsuranceProvider());
        dto.setInsuranceExpiryDate(vehicle.getInsuranceExpiryDate());
        dto.setPucExpiryDate(vehicle.getPucExpiryDate());
        dto.setWarrantyExpiryDate(vehicle.getWarrantyExpiryDate());
        dto.setPrimary(vehicle.isPrimary());
        dto.setDemo(vehicle.isDemo());
        dto.setCreatedAt(vehicle.getCreatedAt());
        dto.setUpdatedAt(vehicle.getUpdatedAt());
        return dto;
    }


    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public String getInsurancePolicyNumber() { return insurancePolicyNumber; }
    public void setInsurancePolicyNumber(String insurancePolicyNumber) { this.insurancePolicyNumber = insurancePolicyNumber; }

    public String getInsuranceProvider() { return insuranceProvider; }
    public void setInsuranceProvider(String insuranceProvider) { this.insuranceProvider = insuranceProvider; }

    public LocalDate getInsuranceExpiryDate() { return insuranceExpiryDate; }
    public void setInsuranceExpiryDate(LocalDate insuranceExpiryDate) { this.insuranceExpiryDate = insuranceExpiryDate; }

    public LocalDate getPucExpiryDate() { return pucExpiryDate; }
    public void setPucExpiryDate(LocalDate pucExpiryDate) { this.pucExpiryDate = pucExpiryDate; }

    public LocalDate getWarrantyExpiryDate() { return warrantyExpiryDate; }
    public void setWarrantyExpiryDate(LocalDate warrantyExpiryDate) { this.warrantyExpiryDate = warrantyExpiryDate; }

    public boolean isPrimary() { return primary; }
    public void setPrimary(boolean primary) { this.primary = primary; }

    public boolean isDemo() { return isDemo; }
    public void setDemo(boolean demo) { this.isDemo = demo; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
