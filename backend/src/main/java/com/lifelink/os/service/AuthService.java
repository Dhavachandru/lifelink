package com.lifelink.os.service;

import com.lifelink.os.domain.RefreshToken;
import com.lifelink.os.domain.User;
import com.lifelink.os.domain.UserSettings;
import com.lifelink.os.dto.auth.*;
import com.lifelink.os.exception.BadRequestException;
import com.lifelink.os.exception.ResourceNotFoundException;
import com.lifelink.os.exception.UnauthorizedAccessException;
import com.lifelink.os.repository.RefreshTokenRepository;
import com.lifelink.os.repository.UserRepository;
import com.lifelink.os.repository.UserSettingsRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            UserSettingsRepository userSettingsRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public TokenResponse register(RegisterRequest request, String ip) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new BadRequestException("An account with this email address already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole("USER");

        User savedUser = userRepository.save(user);

        // Initialize default user settings
        UserSettings settings = new UserSettings(savedUser);
        userSettingsRepository.save(settings);

        auditLogService.logAction(savedUser.getId(), "USER_REGISTERED", "USER", savedUser.getId().toString(), "Account created successfully", ip);

        return generateTokens(savedUser);
    }

    @Transactional
    public TokenResponse login(LoginRequest request, String ip) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            auditLogService.logAction(user.getId(), "LOGIN_FAILED", "USER", user.getId().toString(), "Bad password attempt", ip);
            throw new BadCredentialsException("Invalid email or password");
        }

        auditLogService.logAction(user.getId(), "LOGIN_SUCCESS", "USER", user.getId().toString(), "User logged in", ip);

        return generateTokens(user);
    }

    @Transactional
    public TokenResponse refresh(RefreshTokenRequest request) {
        String tokenStr = request.getRefreshToken();
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHashAndRevokedFalse(tokenStr)
                .orElseThrow(() -> new UnauthorizedAccessException("Invalid or revoked refresh token"));

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new UnauthorizedAccessException("Refresh token has expired");
        }

        // Revoke the old refresh token (token rotation pattern)
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        return generateTokens(refreshToken.getUser());
    }

    @Transactional
    public void logout(UUID userId) {
        refreshTokenRepository.revokeAllUserTokens(userId);
        auditLogService.logAction(userId, "LOGOUT", "USER", userId.toString(), "User logged out, all refresh tokens revoked", null);
    }

    private TokenResponse generateTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String rawRefreshToken = jwtService.generateSecureRefreshTokenString();

        LocalDateTime expiresAt = LocalDateTime.now().plusNanos(jwtService.getRefreshExpirationMs() * 1_000_000);
        RefreshToken refreshToken = new RefreshToken(user, rawRefreshToken, expiresAt);
        refreshTokenRepository.save(refreshToken);

        UserDto userDto = UserDto.fromEntity(user);
        return new TokenResponse(accessToken, rawRefreshToken, jwtService.getAccessExpirationMs() / 1000, userDto);
    }
}
