package com.lifelink.os.dto.vehicle;

import com.lifelink.os.domain.VehicleDocument;
import com.lifelink.os.domain.enums.DocumentType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class VehicleDocumentDto {
    private UUID id;
    private UUID vehicleId;
    private DocumentType documentType;
    private String documentNumber;
    private LocalDate expiryDate;
    private String fileName;
    private long fileSize;
    private String contentType;
    private String downloadUrl;
    private LocalDateTime createdAt;

    public VehicleDocumentDto() {}

    public static VehicleDocumentDto fromEntity(VehicleDocument doc) {
        VehicleDocumentDto dto = new VehicleDocumentDto();
        dto.setId(doc.getId());
        dto.setVehicleId(doc.getVehicle().getId());
        dto.setDocumentType(doc.getDocumentType());
        dto.setDocumentNumber(doc.getDocumentNumber());
        dto.setExpiryDate(doc.getExpiryDate());
        dto.setFileName(doc.getFileName());
        dto.setFileSize(doc.getFileSize());
        dto.setContentType(doc.getContentType());
        dto.setCreatedAt(doc.getCreatedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getVehicleId() { return vehicleId; }
    public void setVehicleId(UUID vehicleId) { this.vehicleId = vehicleId; }

    public DocumentType getDocumentType() { return documentType; }
    public void setDocumentType(DocumentType documentType) { this.documentType = documentType; }

    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
