package com.lifelink.os.repository;

import com.lifelink.os.domain.VehicleServiceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleServiceRecordRepository extends JpaRepository<VehicleServiceRecord, UUID> {
    List<VehicleServiceRecord> findByVehicleIdOrderByServiceDateDesc(UUID vehicleId);
    Optional<VehicleServiceRecord> findByIdAndVehicleUserId(UUID id, UUID userId);
}
