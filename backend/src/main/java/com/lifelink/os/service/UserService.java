package com.lifelink.os.service;

import com.lifelink.os.domain.User;
import com.lifelink.os.dto.auth.UserDto;
import com.lifelink.os.exception.ResourceNotFoundException;
import com.lifelink.os.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto updateProfile(UUID userId, String fullName, String phoneNumber) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (fullName != null && !fullName.isBlank()) {
            user.setFullName(fullName.trim());
        }
        if (phoneNumber != null) {
            user.setPhoneNumber(phoneNumber.trim());
        }

        User updated = userRepository.save(user);
        auditLogService.logAction(userId, "PROFILE_UPDATED", "USER", userId.toString(), "Profile details updated", null);
        return UserDto.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> exportUserData(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> exportData = new HashMap<>();
        exportData.put("profile", UserDto.fromEntity(user));
        exportData.put("exportTimestamp", java.time.LocalDateTime.now());
        exportData.put("formatVersion", "LIFELINK_OS_EXPORT_1.0");

        auditLogService.logAction(userId, "DATA_EXPORT_REQUESTED", "USER", userId.toString(), "User requested full data export", null);
        return exportData;
    }
}
