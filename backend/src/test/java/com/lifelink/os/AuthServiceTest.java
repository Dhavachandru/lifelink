package com.lifelink.os;

import com.lifelink.os.domain.RefreshToken;
import com.lifelink.os.domain.User;
import com.lifelink.os.dto.auth.LoginRequest;
import com.lifelink.os.dto.auth.RefreshTokenRequest;
import com.lifelink.os.dto.auth.RegisterRequest;
import com.lifelink.os.dto.auth.TokenResponse;
import com.lifelink.os.exception.BadRequestException;
import com.lifelink.os.repository.RefreshTokenRepository;
import com.lifelink.os.repository.UserRepository;
import com.lifelink.os.repository.UserSettingsRepository;
import com.lifelink.os.service.AuditLogService;
import com.lifelink.os.service.AuthService;
import com.lifelink.os.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private UserSettingsRepository userSettingsRepository;
    @Mock
    private AuditLogService auditLogService;

    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService("test_secret_key_at_least_32_bytes_long_for_hmac_sha256", 900000, 604800000);
        authService = new AuthService(userRepository, refreshTokenRepository, userSettingsRepository, passwordEncoder, jwtService, auditLogService);
    }

    @Test
    @DisplayName("Register with new email should create user and return tokens")
    void testRegisterSuccess() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("newuser@example.com");
        req.setPassword("Password123!");
        req.setFullName("John Doe");

        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TokenResponse res = authService.register(req, "127.0.0.1");

        assertNotNull(res);
        assertNotNull(res.getAccessToken());
        assertNotNull(res.getRefreshToken());
        assertEquals("newuser@example.com", res.getUser().getEmail());
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Register with existing email should throw BadRequestException")
    void testRegisterDuplicateEmail() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("exists@example.com");
        req.setPassword("Password123!");
        req.setFullName("Jane Doe");

        when(userRepository.existsByEmail("exists@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(req, "127.0.0.1"));
    }

    @Test
    @DisplayName("Login with valid credentials should succeed")
    void testLoginSuccess() {
        User user = new User("valid@example.com", passwordEncoder.encode("Password123!"), "Valid User", "+15551234567");
        when(userRepository.findByEmail("valid@example.com")).thenReturn(Optional.of(user));

        LoginRequest req = new LoginRequest("valid@example.com", "Password123!");
        TokenResponse res = authService.login(req, "127.0.0.1");

        assertNotNull(res);
        assertNotNull(res.getAccessToken());
    }

    @Test
    @DisplayName("Login with incorrect password should throw BadCredentialsException")
    void testLoginInvalidPassword() {
        User user = new User("valid@example.com", passwordEncoder.encode("Password123!"), "Valid User", "+15551234567");
        when(userRepository.findByEmail("valid@example.com")).thenReturn(Optional.of(user));

        LoginRequest req = new LoginRequest("valid@example.com", "WrongPassword!");
        assertThrows(BadCredentialsException.class, () -> authService.login(req, "127.0.0.1"));
    }
}
