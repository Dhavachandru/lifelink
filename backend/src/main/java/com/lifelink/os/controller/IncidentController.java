package com.lifelink.os.controller;

import com.lifelink.os.common.SecurityUtils;
import com.lifelink.os.dto.assistance.AssistanceRequestDto;
import com.lifelink.os.dto.assistance.CreateAssistanceRequestDto;
import com.lifelink.os.dto.common.ApiResponse;
import com.lifelink.os.dto.incident.*;
import com.lifelink.os.service.AssistanceService;
import com.lifelink.os.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/incidents")
@Tag(name = "Incidents", description = "Endpoints for incident reporting, AI triage, actions, timelines, and assistance")
public class IncidentController {

    private final IncidentService incidentService;
    private final AssistanceService assistanceService;

    public IncidentController(IncidentService incidentService, AssistanceService assistanceService) {
        this.incidentService = incidentService;
        this.assistanceService = assistanceService;
    }

    @GetMapping
    @Operation(summary = "List all incidents for current user")
    public ResponseEntity<ApiResponse<List<IncidentDto>>> getIncidents() {
        UUID userId = SecurityUtils.getCurrentUserId();
        List<IncidentDto> incidents = incidentService.getUserIncidents(userId);
        return ResponseEntity.ok(ApiResponse.ok(incidents));
    }

    @PostMapping
    @Operation(summary = "Report an incident with AI triage and actionable safety protocol")
    public ResponseEntity<ApiResponse<IncidentDetailDto>> createIncident(
            @Valid @RequestBody CreateIncidentRequest request,
            HttpServletRequest httpRequest) {
        UUID userId = SecurityUtils.getCurrentUserId();
        String ip = httpRequest.getRemoteAddr();
        IncidentDetailDto detail = incidentService.createIncident(request, userId, ip);
        return ResponseEntity.ok(ApiResponse.ok("Incident reported and triaged", detail));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed incident overview with checklist, timeline, and attachments")
    public ResponseEntity<ApiResponse<IncidentDetailDto>> getIncidentDetail(@PathVariable("id") UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        IncidentDetailDto detail = incidentService.getIncidentDetail(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(detail));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update incident status (REPORTED, DISPATCHED, RESOLVING, RESOLVED, CANCELLED)")
    public ResponseEntity<ApiResponse<IncidentDetailDto>> updateStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateIncidentStatusRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        IncidentDetailDto detail = incidentService.updateStatus(id, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Incident status updated", detail));
    }

    @PostMapping("/{id}/notes")
    @Operation(summary = "Add a progress note or update to the incident timeline")
    public ResponseEntity<ApiResponse<IncidentDetailDto>> addNote(
            @PathVariable("id") UUID id,
            @Valid @RequestBody AddIncidentNoteRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        IncidentDetailDto detail = incidentService.addNote(id, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Note added to timeline", detail));
    }

    @PatchMapping("/{id}/actions/{actionId}/toggle")
    @Operation(summary = "Toggle completion status of an incident action checklist step")
    public ResponseEntity<ApiResponse<String>> toggleAction(
            @PathVariable("id") UUID id,
            @PathVariable("actionId") UUID actionId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        incidentService.toggleActionStep(actionId, id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Action step updated", "Toggled step"));
    }

    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Attach evidence photos or damage documents to incident")
    public ResponseEntity<ApiResponse<IncidentAttachmentDto>> uploadAttachment(
            @PathVariable("id") UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "attachmentType", defaultValue = "PHOTO") String attachmentType,
            @RequestParam(value = "notes", required = false) String notes) {
        UUID userId = SecurityUtils.getCurrentUserId();
        IncidentAttachmentDto att = incidentService.uploadAttachment(id, userId, file, attachmentType, notes);
        return ResponseEntity.ok(ApiResponse.ok("Attachment uploaded", att));
    }

    @GetMapping("/{id}/attachments/{attId}")
    @Operation(summary = "Download incident attachment")
    public ResponseEntity<byte[]> downloadAttachment(
            @PathVariable("id") UUID id,
            @PathVariable("attId") UUID attId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        byte[] data = incidentService.downloadAttachment(id, attId, userId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"incident-file-" + attId + "\"")
                .body(data);
    }

    @GetMapping("/{id}/assistance")
    @Operation(summary = "List assistance requests for this incident")
    public ResponseEntity<ApiResponse<List<AssistanceRequestDto>>> getAssistanceRequests(@PathVariable("id") UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        List<AssistanceRequestDto> requests = assistanceService.getIncidentAssistanceRequests(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(requests));
    }

    @PostMapping("/{id}/assistance")
    @Operation(summary = "Request roadside assistance or dispatch service after explicit user confirmation")
    public ResponseEntity<ApiResponse<AssistanceRequestDto>> requestAssistance(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CreateAssistanceRequestDto request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        AssistanceRequestDto res = assistanceService.requestAssistance(id, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Assistance requested", res));
    }
}
