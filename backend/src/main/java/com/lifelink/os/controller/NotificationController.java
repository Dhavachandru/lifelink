package com.lifelink.os.controller;

import com.lifelink.os.common.SecurityUtils;
import com.lifelink.os.dto.common.ApiResponse;
import com.lifelink.os.dto.notification.NotificationDto;
import com.lifelink.os.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Endpoints for in-app alert notifications and document expiry notices")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get all notifications for authenticated user")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications() {
        UUID userId = SecurityUtils.getCurrentUserId();
        List<NotificationDto> list = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark specific notification as read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable("id") UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Marked as read", "Updated"));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<String>> markAllAsRead() {
        UUID userId = SecurityUtils.getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.ok("Marked all as read", "Updated"));
    }
}
