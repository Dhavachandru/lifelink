package com.lifelink.os.controller;

import com.lifelink.os.common.SecurityUtils;
import com.lifelink.os.dto.auth.LoginRequest;
import com.lifelink.os.dto.auth.RefreshTokenRequest;
import com.lifelink.os.dto.auth.RegisterRequest;
import com.lifelink.os.dto.auth.TokenResponse;
import com.lifelink.os.dto.common.ApiResponse;
import com.lifelink.os.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for registration, login, token refresh, and logout")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<TokenResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        TokenResponse response = authService.register(request, ip);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and receive access + refresh tokens")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        TokenResponse response = authService.login(request, ip);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh an expired access token using a valid refresh token")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse response = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.ok("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out user and invalidate refresh tokens")
    public ResponseEntity<ApiResponse<String>> logout() {
        try {
            UUID userId = SecurityUtils.getCurrentUserId();
            authService.logout(userId);
        } catch (Exception ignored) {
            // Logout is best-effort even if token expired
        }
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", "Session terminated"));
    }
}
