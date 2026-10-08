package com.lifelink.os.dto.vehicle;

import com.lifelink.os.domain.enums.DocumentType;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class CreateVehicleDocumentRequest {
    @NotNull(message = "Document type is required")
    private DocumentType documentType;

    private String documentNumber;
    private LocalDate expiryDate;

    public CreateVehicleDocumentRequest() {}

    public DocumentType getDocumentType() { return documentType; }
    public void setDocumentType(DocumentType documentType) { this.documentType = documentType; }

    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
}
