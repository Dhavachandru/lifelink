package com.lifelink.os.repository;

import com.lifelink.os.domain.IncidentAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IncidentAttachmentRepository extends JpaRepository<IncidentAttachment, UUID> {
    List<IncidentAttachment> findByIncidentIdOrderByCreatedAtDesc(UUID incidentId);
    Optional<IncidentAttachment> findByIdAndIncidentUserId(UUID id, UUID userId);
}
