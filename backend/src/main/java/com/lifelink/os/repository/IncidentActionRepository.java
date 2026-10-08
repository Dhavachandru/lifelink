package com.lifelink.os.repository;

import com.lifelink.os.domain.IncidentAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IncidentActionRepository extends JpaRepository<IncidentAction, UUID> {
    List<IncidentAction> findByIncidentIdOrderByStepOrderAsc(UUID incidentId);
}
