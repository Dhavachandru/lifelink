package com.lifelink.os.repository;

import com.lifelink.os.domain.VehicleDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleDocumentRepository extends JpaRepository<VehicleDocument, UUID> {
    List<VehicleDocument> findByVehicleIdOrderByCreatedAtDesc(UUID vehicleId);
    Optional<VehicleDocument> findByIdAndVehicleUserId(UUID id, UUID userId);
    List<VehicleDocument> findByVehicleUserIdAndExpiryDateBetween(UUID userId, LocalDate start, LocalDate end);
}
