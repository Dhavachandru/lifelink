package com.lifelink.os.repository;

import com.lifelink.os.domain.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    List<Vehicle> findByUserIdOrderByIsPrimaryDescCreatedAtDesc(UUID userId);
    Optional<Vehicle> findByIdAndUserId(UUID id, UUID userId);
    Optional<Vehicle> findByUserIdAndIsPrimaryTrue(UUID userId);
}
