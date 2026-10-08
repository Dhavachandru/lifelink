package com.lifelink.os.controller;

import com.lifelink.os.dto.ai.IncidentAssessmentRequest;
import com.lifelink.os.dto.ai.IncidentAssessmentResponse;
import com.lifelink.os.dto.common.ApiResponse;
import com.lifelink.os.service.ai.AiAssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Incident Assessment", description = "Endpoints for triage assessment and actionable safety protocols")
public class AiController {

    private final AiAssessmentService aiAssessmentService;

    public AiController(AiAssessmentService aiAssessmentService) {
        this.aiAssessmentService = aiAssessmentService;
    }

    @PostMapping("/incident-assessments")
    @Operation(summary = "Assess an incident description to generate safety steps, urgency level, and checklist")
    public ResponseEntity<ApiResponse<IncidentAssessmentResponse>> assessIncident(
            @Valid @RequestBody IncidentAssessmentRequest request) {
        IncidentAssessmentResponse assessment = aiAssessmentService.assessIncident(request);
        return ResponseEntity.ok(ApiResponse.ok("Assessment completed", assessment));
    }
}
