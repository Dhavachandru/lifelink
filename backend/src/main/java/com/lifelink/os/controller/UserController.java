package com.lifelink.os.controller;

import com.lifelink.os.common.SecurityUtils;
import com.lifelink.os.dto.auth.UserDto;
import com.lifelink.os.dto.common.ApiResponse;
import com.lifelink.os.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "Endpoints for user profile and GDPR export")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get the authenticated user's profile")
    public ResponseEntity<ApiResponse<UserDto>> getMyProfile() {
        UUID userId = SecurityUtils.getCurrentUserId();
        UserDto user = userService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PatchMapping("/me")
    @Operation(summary = "Update user full name or phone number")
    public ResponseEntity<ApiResponse<UserDto>> updateMyProfile(@RequestBody Map<String, String> body) {
        UUID userId = SecurityUtils.getCurrentUserId();
        String fullName = body.get("fullName");
        String phoneNumber = body.get("phoneNumber");
        UserDto updated = userService.updateProfile(userId, fullName, phoneNumber);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", updated));
    }

    @GetMapping("/me/export")
    @Operation(summary = "Export all user data in JSON format for privacy compliance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> exportUserData() {
        UUID userId = SecurityUtils.getCurrentUserId();
        Map<String, Object> data = userService.exportUserData(userId);
        return ResponseEntity.ok(ApiResponse.ok("User data export generated", data));
    }
}
