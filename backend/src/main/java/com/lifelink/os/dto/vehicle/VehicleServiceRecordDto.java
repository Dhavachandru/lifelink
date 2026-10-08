package com.lifelink.os.dto.vehicle;

import com.lifelink.os.domain.VehicleServiceRecord;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class VehicleServiceRecordDto {
    private UUID id;
    private UUID vehicleId;
    private LocalDate serviceDate;
    private Integer mileage;
    private String serviceCenter;
    private String description;
    private BigDecimal cost;
    private String invoiceFileKey;
    private LocalDateTime createdAt;

    public VehicleServiceRecordDto() {}

    public static VehicleServiceRecordDto fromEntity(VehicleServiceRecord record) {
        VehicleServiceRecordDto dto = new VehicleServiceRecordDto();
        dto.setId(record.getId());
        dto.setVehicleId(record.getVehicle().getId());
        dto.setServiceDate(record.getServiceDate());
        dto.setMileage(record.getMileage());
        dto.setServiceCenter(record.getServiceCenter());
        dto.setDescription(record.getDescription());
        dto.setCost(record.getCost());
        dto.setInvoiceFileKey(record.getInvoiceFileKey());
        dto.setCreatedAt(record.getCreatedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getVehicleId() { return vehicleId; }
    public void setVehicleId(UUID vehicleId) { this.vehicleId = vehicleId; }

    public LocalDate getServiceDate() { return serviceDate; }
    public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }

    public Integer getMileage() { return mileage; }
    public void setMileage(Integer mileage) { this.mileage = mileage; }

    public String getServiceCenter() { return serviceCenter; }
    public void setServiceCenter(String serviceCenter) { this.serviceCenter = serviceCenter; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }

    public String getInvoiceFileKey() { return invoiceFileKey; }
    public void setInvoiceFileKey(String invoiceFileKey) { this.invoiceFileKey = invoiceFileKey; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
