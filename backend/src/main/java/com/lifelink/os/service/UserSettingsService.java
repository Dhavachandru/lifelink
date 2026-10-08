package com.lifelink.os.service;

import com.lifelink.os.domain.User;
import com.lifelink.os.domain.UserSettings;
import com.lifelink.os.dto.settings.UpdateUserSettingsRequest;
import com.lifelink.os.dto.settings.UserSettingsDto;
import com.lifelink.os.exception.ResourceNotFoundException;
import com.lifelink.os.repository.UserRepository;
import com.lifelink.os.repository.UserSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserSettingsService {

    private final UserSettingsRepository settingsRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public UserSettingsService(
            UserSettingsRepository settingsRepository,
            UserRepository userRepository,
            AuditLogService auditLogService) {
        this.settingsRepository = settingsRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public UserSettingsDto getSettings(UUID userId) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    UserSettings newSettings = new UserSettings(user);
                    return settingsRepository.save(newSettings);
                });

        return UserSettingsDto.fromEntity(settings);
    }

    @Transactional
    public UserSettingsDto updateSettings(UUID userId, UpdateUserSettingsRequest req) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    UserSettings newSettings = new UserSettings(user);
                    return settingsRepository.save(newSettings);
                });

        if (req.getNotificationEmail() != null) settings.setNotificationEmail(req.getNotificationEmail());
        if (req.getNotificationSms() != null) settings.setNotificationSms(req.getNotificationSms());
        if (req.getPushNotifications() != null) settings.setPushNotifications(req.getPushNotifications());
        if (req.getShareLocationDefault() != null) settings.setShareLocationDefault(req.getShareLocationDefault());
        if (req.getDarkMode() != null) settings.setDarkMode(req.getDarkMode());

        UserSettings saved = settingsRepository.save(settings);
        auditLogService.logAction(userId, "SETTINGS_UPDATED", "SETTINGS", saved.getId().toString(), "Updated preferences", null);

        return UserSettingsDto.fromEntity(saved);
    }
}
