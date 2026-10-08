package com.lifelink.os.repository;

import com.lifelink.os.domain.AssistanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssistanceRequestRepository extends JpaRepository<AssistanceRequest, UUID> {
    List<AssistanceRequest> findByIncidentIdOrderByRequestedAtDesc(UUID incidentId);
}
