package com.lifelink.os.repository;

import com.lifelink.os.domain.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, UUID> {
    List<Incident> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Incident> findByIdAndUserId(UUID id, UUID userId);
    List<Incident> findByUserIdAndStatusNotInOrderByCreatedAtDesc(UUID userId, List<com.lifelink.os.domain.enums.IncidentStatus> statuses);
}
