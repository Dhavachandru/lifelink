package com.lifelink.os.controller;

import com.lifelink.os.common.SecurityUtils;
import com.lifelink.os.dto.common.ApiResponse;
import com.lifelink.os.dto.settings.UpdateUserSettingsRequest;
import com.lifelink.os.dto.settings.UserSettingsDto;
import com.lifelink.os.service.UserSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/settings")
@Tag(name = "User Settings", description = "Endpoints for notification preferences and privacy defaults")
public class SettingsController {

    private final UserSettingsService settingsService;

    public SettingsController(UserSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    @Operation(summary = "Get user settings and privacy preferences")
    public ResponseEntity<ApiResponse<UserSettingsDto>> getSettings() {
        UUID userId = SecurityUtils.getCurrentUserId();
        UserSettingsDto settings = settingsService.getSettings(userId);
        return ResponseEntity.ok(ApiResponse.ok(settings));
    }

    @PutMapping
    @Operation(summary = "Update user settings and privacy preferences")
    public ResponseEntity<ApiResponse<UserSettingsDto>> updateSettings(
            @RequestBody UpdateUserSettingsRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        UserSettingsDto updated = settingsService.updateSettings(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Settings updated", updated));
    }
}
