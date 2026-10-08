package com.lifelink.os.service;

import com.lifelink.os.domain.Notification;
import com.lifelink.os.domain.User;
import com.lifelink.os.domain.enums.NotificationType;
import com.lifelink.os.dto.notification.NotificationDto;
import com.lifelink.os.repository.EmergencyContactRepository;
import com.lifelink.os.repository.NotificationRepository;
import com.lifelink.os.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmergencyContactRepository emergencyContactRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            EmergencyContactRepository emergencyContactRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.emergencyContactRepository = emergencyContactRepository;
    }

    @Transactional
    public void createNotification(UUID userId, String title, String message, NotificationType type, UUID incidentId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("Cannot create notification: User not found with ID {}", userId);
            return;
        }

        Notification notification = new Notification(user, title, message, type, incidentId);
        notificationRepository.save(notification);

        // Development logger fallback (does not leak sensitive personal data or secrets)
        log.info("[NOTIFICATION DISPATCHED] Type: {} | User: {} | Title: '{}' | IncidentId: {}",
                type, user.getEmail(), title, incidentId);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        notificationRepository.findByIdAndUserId(notificationId, userId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }
}
