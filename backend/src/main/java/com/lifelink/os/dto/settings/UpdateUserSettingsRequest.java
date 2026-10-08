package com.lifelink.os.dto.settings;

public class UpdateUserSettingsRequest {
    private Boolean notificationEmail;
    private Boolean notificationSms;
    private Boolean pushNotifications;
    private Boolean shareLocationDefault;
    private Boolean darkMode;

    public UpdateUserSettingsRequest() {}

    public Boolean getNotificationEmail() { return notificationEmail; }
    public void setNotificationEmail(Boolean notificationEmail) { this.notificationEmail = notificationEmail; }

    public Boolean getNotificationSms() { return notificationSms; }
    public void setNotificationSms(Boolean notificationSms) { this.notificationSms = notificationSms; }

    public Boolean getPushNotifications() { return pushNotifications; }
    public void setPushNotifications(Boolean pushNotifications) { this.pushNotifications = pushNotifications; }

    public Boolean getShareLocationDefault() { return shareLocationDefault; }
    public void setShareLocationDefault(Boolean shareLocationDefault) { this.shareLocationDefault = shareLocationDefault; }

    public Boolean getDarkMode() { return darkMode; }
    public void setDarkMode(Boolean darkMode) { this.darkMode = darkMode; }
}
