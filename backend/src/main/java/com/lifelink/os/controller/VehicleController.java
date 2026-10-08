package com.lifelink.os.controller;

import com.lifelink.os.common.SecurityUtils;
import com.lifelink.os.domain.enums.DocumentType;
import com.lifelink.os.dto.common.ApiResponse;
import com.lifelink.os.dto.vehicle.*;
import com.lifelink.os.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles")
@Tag(name = "Vehicle Vault", description = "Endpoints for vehicles, documents, and service histories")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    @Operation(summary = "List all vehicles owned by current user")
    public ResponseEntity<ApiResponse<List<VehicleDto>>> getVehicles() {
        UUID userId = SecurityUtils.getCurrentUserId();
        List<VehicleDto> vehicles = vehicleService.getUserVehicles(userId);
        return ResponseEntity.ok(ApiResponse.ok(vehicles));
    }

    @PostMapping
    @Operation(summary = "Register a new vehicle")
    public ResponseEntity<ApiResponse<VehicleDto>> createVehicle(@Valid @RequestBody CreateVehicleRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        VehicleDto vehicle = vehicleService.createVehicle(request, userId);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle created", vehicle));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vehicle details by ID")
    public ResponseEntity<ApiResponse<VehicleDto>> getVehicle(@PathVariable("id") UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        VehicleDto vehicle = vehicleService.getVehicleById(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(vehicle));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update vehicle details")
    public ResponseEntity<ApiResponse<VehicleDto>> updateVehicle(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CreateVehicleRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        VehicleDto vehicle = vehicleService.updateVehicle(id, request, userId);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle updated", vehicle));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete vehicle from vault")
    public ResponseEntity<ApiResponse<String>> deleteVehicle(@PathVariable("id") UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        vehicleService.deleteVehicle(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle removed", "Vehicle deleted successfully"));
    }

    @GetMapping("/{id}/documents")
    @Operation(summary = "List documents for a specific vehicle")
    public ResponseEntity<ApiResponse<List<VehicleDocumentDto>>> getVehicleDocuments(@PathVariable("id") UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        List<VehicleDocumentDto> documents = vehicleService.getVehicleDocuments(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(documents));
    }

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload insurance, PUC, registration or warranty document")
    public ResponseEntity<ApiResponse<VehicleDocumentDto>> uploadDocument(
            @PathVariable("id") UUID id,
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam(value = "documentNumber", required = false) String documentNumber,
            @RequestParam(value = "expiryDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
            @RequestParam("file") MultipartFile file) {
        UUID userId = SecurityUtils.getCurrentUserId();
        VehicleDocumentDto doc = vehicleService.uploadVehicleDocument(id, userId, documentType, documentNumber, expiryDate, file);
        return ResponseEntity.ok(ApiResponse.ok("Document uploaded", doc));
    }

    @DeleteMapping("/documents/{docId}")
    @Operation(summary = "Delete a vehicle document")
    public ResponseEntity<ApiResponse<String>> deleteDocument(@PathVariable("docId") UUID docId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        vehicleService.deleteVehicleDocument(docId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Document deleted", "Document removed"));
    }

    @GetMapping("/{id}/services")
    @Operation(summary = "List service and maintenance history for a vehicle")
    public ResponseEntity<ApiResponse<List<VehicleServiceRecordDto>>> getServiceRecords(@PathVariable("id") UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        List<VehicleServiceRecordDto> records = vehicleService.getServiceRecords(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(records));
    }

    @PostMapping("/{id}/services")
    @Operation(summary = "Log a service or repair record")
    public ResponseEntity<ApiResponse<VehicleServiceRecordDto>> addServiceRecord(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CreateVehicleServiceRecordRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        VehicleServiceRecordDto record = vehicleService.addServiceRecord(id, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Service record added", record));
    }
}
