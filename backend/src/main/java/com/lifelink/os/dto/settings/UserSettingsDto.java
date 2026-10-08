package com.lifelink.os.dto.settings;

import com.lifelink.os.domain.UserSettings;
import java.time.LocalDateTime;
import java.util.UUID;

public class UserSettingsDto {
    private UUID id;
    private UUID userId;
    private boolean notificationEmail;
    private boolean notificationSms;
    private boolean pushNotifications;
    private boolean shareLocationDefault;
    private boolean darkMode;
    private LocalDateTime updatedAt;

    public UserSettingsDto() {}

    public static UserSettingsDto fromEntity(UserSettings settings) {
        UserSettingsDto dto = new UserSettingsDto();
        dto.setId(settings.getId());
        dto.setUserId(settings.getUser().getId());
        dto.setNotificationEmail(settings.isNotificationEmail());
        dto.setNotificationSms(settings.isNotificationSms());
        dto.setPushNotifications(settings.isPushNotifications());
        dto.setShareLocationDefault(settings.isShareLocationDefault());
        dto.setDarkMode(settings.isDarkMode());
        dto.setUpdatedAt(settings.getUpdatedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public boolean isNotificationEmail() { return notificationEmail; }
    public void setNotificationEmail(boolean notificationEmail) { this.notificationEmail = notificationEmail; }

    public boolean isNotificationSms() { return notificationSms; }
    public void setNotificationSms(boolean notificationSms) { this.notificationSms = notificationSms; }

    public boolean isPushNotifications() { return pushNotifications; }
    public void setPushNotifications(boolean pushNotifications) { this.pushNotifications = pushNotifications; }

    public boolean isShareLocationDefault() { return shareLocationDefault; }
    public void setShareLocationDefault(boolean shareLocationDefault) { this.shareLocationDefault = shareLocationDefault; }

    public boolean isDarkMode() { return darkMode; }
    public void setDarkMode(boolean darkMode) { this.darkMode = darkMode; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
