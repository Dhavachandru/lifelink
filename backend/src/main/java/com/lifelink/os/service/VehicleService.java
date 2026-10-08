package com.lifelink.os.service;

import com.lifelink.os.domain.User;
import com.lifelink.os.domain.Vehicle;
import com.lifelink.os.domain.VehicleDocument;
import com.lifelink.os.domain.VehicleServiceRecord;
import com.lifelink.os.domain.enums.DocumentType;
import com.lifelink.os.domain.enums.NotificationType;
import com.lifelink.os.dto.vehicle.*;
import com.lifelink.os.exception.BadRequestException;
import com.lifelink.os.exception.ResourceNotFoundException;
import com.lifelink.os.exception.UnauthorizedAccessException;
import com.lifelink.os.repository.UserRepository;
import com.lifelink.os.repository.VehicleDocumentRepository;
import com.lifelink.os.repository.VehicleRepository;
import com.lifelink.os.repository.VehicleServiceRecordRepository;
import com.lifelink.os.service.storage.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleDocumentRepository vehicleDocumentRepository;
    private final VehicleServiceRecordRepository vehicleServiceRecordRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public VehicleService(
            VehicleRepository vehicleRepository,
            VehicleDocumentRepository vehicleDocumentRepository,
            VehicleServiceRecordRepository vehicleServiceRecordRepository,
            UserRepository userRepository,
            StorageService storageService,
            NotificationService notificationService,
            AuditLogService auditLogService) {
        this.vehicleRepository = vehicleRepository;
        this.vehicleDocumentRepository = vehicleDocumentRepository;
        this.vehicleServiceRecordRepository = vehicleServiceRecordRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<VehicleDto> getUserVehicles(UUID userId) {
        return vehicleRepository.findByUserIdOrderByIsPrimaryDescCreatedAtDesc(userId)
                .stream()
                .map(VehicleDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VehicleDto getVehicleById(UUID vehicleId, UUID userId) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found or unauthorized"));
        return VehicleDto.fromEntity(vehicle);
    }

    @Transactional
    public VehicleDto createVehicle(CreateVehicleRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.isPrimary()) {
            vehicleRepository.findByUserIdAndIsPrimaryTrue(userId).ifPresent(v -> {
                v.setPrimary(false);
                vehicleRepository.save(v);
            });
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setUser(user);
        vehicle.setMake(request.getMake().trim());
        vehicle.setModel(request.getModel().trim());
        vehicle.setYear(request.getYear());
        vehicle.setLicensePlate(request.getLicensePlate().trim().toUpperCase());
        vehicle.setVin(request.getVin() != null ? request.getVin().trim().toUpperCase() : null);
        vehicle.setColor(request.getColor());
        vehicle.setFuelType(request.getFuelType() != null ? request.getFuelType() : "PETROL");
        vehicle.setInsurancePolicyNumber(request.getInsurancePolicyNumber());
        vehicle.setInsuranceProvider(request.getInsuranceProvider());
        vehicle.setInsuranceExpiryDate(request.getInsuranceExpiryDate());
        vehicle.setPucExpiryDate(request.getPucExpiryDate());
        vehicle.setWarrantyExpiryDate(request.getWarrantyExpiryDate());
        vehicle.setPrimary(request.isPrimary());

        Vehicle saved = vehicleRepository.save(vehicle);
        auditLogService.logAction(userId, "VEHICLE_CREATED", "VEHICLE", saved.getId().toString(), "Added vehicle: " + saved.getMake() + " " + saved.getModel(), null);

        // Check if any dates are expiring soon (within 30 days) and send reminder notification
        checkExpiryAndNotify(saved, userId);

        return VehicleDto.fromEntity(saved);
    }

    @Transactional
    public VehicleDto updateVehicle(UUID vehicleId, CreateVehicleRequest request, UUID userId) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found or unauthorized"));

        if (request.isPrimary() && !vehicle.isPrimary()) {
            vehicleRepository.findByUserIdAndIsPrimaryTrue(userId).ifPresent(v -> {
                v.setPrimary(false);
                vehicleRepository.save(v);
            });
        }

        vehicle.setMake(request.getMake().trim());
        vehicle.setModel(request.getModel().trim());
        vehicle.setYear(request.getYear());
        vehicle.setLicensePlate(request.getLicensePlate().trim().toUpperCase());
        vehicle.setVin(request.getVin() != null ? request.getVin().trim().toUpperCase() : null);
        vehicle.setColor(request.getColor());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setInsurancePolicyNumber(request.getInsurancePolicyNumber());
        vehicle.setInsuranceProvider(request.getInsuranceProvider());
        vehicle.setInsuranceExpiryDate(request.getInsuranceExpiryDate());
        vehicle.setPucExpiryDate(request.getPucExpiryDate());
        vehicle.setWarrantyExpiryDate(request.getWarrantyExpiryDate());
        vehicle.setPrimary(request.isPrimary());

        Vehicle saved = vehicleRepository.save(vehicle);
        auditLogService.logAction(userId, "VEHICLE_UPDATED", "VEHICLE", saved.getId().toString(), "Updated vehicle details", null);
        checkExpiryAndNotify(saved, userId);

        return VehicleDto.fromEntity(saved);
    }

    @Transactional
    public void deleteVehicle(UUID vehicleId, UUID userId) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found or unauthorized"));

        vehicleRepository.delete(vehicle);
        auditLogService.logAction(userId, "VEHICLE_DELETED", "VEHICLE", vehicleId.toString(), "Vehicle deleted", null);
    }

    @Transactional(readOnly = true)
    public List<VehicleDocumentDto> getVehicleDocuments(UUID vehicleId, UUID userId) {
        vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found or unauthorized"));

        return vehicleDocumentRepository.findByVehicleIdOrderByCreatedAtDesc(vehicleId)
                .stream()
                .map(VehicleDocumentDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehicleDocumentDto uploadVehicleDocument(
            UUID vehicleId, UUID userId, DocumentType type, String docNumber, LocalDate expiryDate, MultipartFile file) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found or unauthorized"));

        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }

        try {
            String fileKey = storageService.storeFile(file.getBytes(), file.getOriginalFilename(), file.getContentType());
            VehicleDocument doc = new VehicleDocument();
            doc.setVehicle(vehicle);
            doc.setDocumentType(type);
            doc.setDocumentNumber(docNumber);
            doc.setExpiryDate(expiryDate);
            doc.setFileKey(fileKey);
            doc.setFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document");
            doc.setFileSize(file.getSize());
            doc.setContentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");

            VehicleDocument saved = vehicleDocumentRepository.save(doc);
            auditLogService.logAction(userId, "VEHICLE_DOCUMENT_UPLOADED", "DOCUMENT", saved.getId().toString(), "Uploaded " + type + " for " + vehicle.getLicensePlate(), null);
            return VehicleDocumentDto.fromEntity(saved);
        } catch (IOException e) {
            throw new RuntimeException("Could not store vehicle document", e);
        }
    }

    @Transactional
    public void deleteVehicleDocument(UUID documentId, UUID userId) {
        VehicleDocument doc = vehicleDocumentRepository.findByIdAndVehicleUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found or unauthorized"));

        storageService.deleteFile(doc.getFileKey());
        vehicleDocumentRepository.delete(doc);
        auditLogService.logAction(userId, "VEHICLE_DOCUMENT_DELETED", "DOCUMENT", documentId.toString(), "Deleted document", null);
    }

    @Transactional(readOnly = true)
    public List<VehicleServiceRecordDto> getServiceRecords(UUID vehicleId, UUID userId) {
        vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found or unauthorized"));

        return vehicleServiceRecordRepository.findByVehicleIdOrderByServiceDateDesc(vehicleId)
                .stream()
                .map(VehicleServiceRecordDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehicleServiceRecordDto addServiceRecord(UUID vehicleId, UUID userId, CreateVehicleServiceRecordRequest req) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found or unauthorized"));

        VehicleServiceRecord record = new VehicleServiceRecord();
        record.setVehicle(vehicle);
        record.setServiceDate(req.getServiceDate());
        record.setMileage(req.getMileage());
        record.setServiceCenter(req.getServiceCenter());
        record.setDescription(req.getDescription());
        record.setCost(req.getCost());

        VehicleServiceRecord saved = vehicleServiceRecordRepository.save(record);
        auditLogService.logAction(userId, "SERVICE_RECORD_ADDED", "SERVICE", saved.getId().toString(), "Added service record", null);
        return VehicleServiceRecordDto.fromEntity(saved);
    }

    private void checkExpiryAndNotify(Vehicle vehicle, UUID userId) {
        LocalDate now = LocalDate.now();
        LocalDate threshold = now.plusDays(30);

        if (vehicle.getInsuranceExpiryDate() != null && vehicle.getInsuranceExpiryDate().isBefore(threshold) && !vehicle.getInsuranceExpiryDate().isBefore(now)) {
            notificationService.createNotification(
                    userId,
                    "Insurance Expiry Notice",
                    "Insurance policy for " + vehicle.getMake() + " " + vehicle.getModel() + " (" + vehicle.getLicensePlate() + ") expires on " + vehicle.getInsuranceExpiryDate() + ".",
                    NotificationType.DOCUMENT_EXPIRY,
                    null
            );
        }

        if (vehicle.getPucExpiryDate() != null && vehicle.getPucExpiryDate().isBefore(threshold) && !vehicle.getPucExpiryDate().isBefore(now)) {
            notificationService.createNotification(
                    userId,
                    "PUC / Emissions Expiry Notice",
                    "Emissions certificate for " + vehicle.getLicensePlate() + " expires on " + vehicle.getPucExpiryDate() + ".",
                    NotificationType.DOCUMENT_EXPIRY,
                    null
            );
        }
    }
}
