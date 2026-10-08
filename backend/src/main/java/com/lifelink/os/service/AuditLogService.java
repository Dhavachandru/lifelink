package com.lifelink.os.service;

import com.lifelink.os.domain.AuditLog;
import com.lifelink.os.domain.User;
import com.lifelink.os.repository.AuditLogRepository;
import com.lifelink.os.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void logAction(UUID userId, String action, String resourceType, String resourceId, String details, String ipAddress) {
        try {
            User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;
            // Clean details to ensure no tokens or passwords leaked
            String safeDetails = (details != null && details.length() > 500) ? details.substring(0, 500) + "..." : details;

            AuditLog entry = new AuditLog(user, action, resourceType, resourceId, safeDetails, ipAddress);
            auditLogRepository.save(entry);
            log.debug("AuditLog: user={}, action={}, resource={}/{}", (user != null ? user.getEmail() : "ANONYMOUS"), action, resourceType, resourceId);
        } catch (Exception e) {
            log.warn("Failed to record audit log: {}", e.getMessage());
        }
    }
}
