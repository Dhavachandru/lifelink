package com.lifelink.os.controller;

import com.lifelink.os.domain.enums.ProviderType;
import com.lifelink.os.dto.assistance.AssistanceProviderDto;
import com.lifelink.os.dto.common.ApiResponse;
import com.lifelink.os.service.AssistanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
@Tag(name = "Providers", description = "Endpoints for roadside assistance and dispatch service directory")
public class ProviderController {

    private final AssistanceService assistanceService;

    public ProviderController(AssistanceService assistanceService) {
        this.assistanceService = assistanceService;
    }

    @GetMapping
    @Operation(summary = "List verified assistance providers")
    public ResponseEntity<ApiResponse<List<AssistanceProviderDto>>> getProviders(
            @RequestParam(value = "providerType", required = false) ProviderType providerType) {
        List<AssistanceProviderDto> providers = assistanceService.getProviders(providerType);
        return ResponseEntity.ok(ApiResponse.ok(providers));
    }

    @GetMapping("/public")
    @Operation(summary = "Public listing of emergency and roadside assistance options")
    public ResponseEntity<ApiResponse<List<AssistanceProviderDto>>> getPublicProviders(
            @RequestParam(value = "providerType", required = false) ProviderType providerType) {
        List<AssistanceProviderDto> providers = assistanceService.getProviders(providerType);
        return ResponseEntity.ok(ApiResponse.ok(providers));
    }
}
