package com.lifelink.os.controller;

import com.lifelink.os.common.SecurityUtils;
import com.lifelink.os.dto.common.ApiResponse;
import com.lifelink.os.dto.contact.CreateEmergencyContactRequest;
import com.lifelink.os.dto.contact.EmergencyContactDto;
import com.lifelink.os.service.EmergencyContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/emergency-contacts")
@Tag(name = "Emergency Contacts", description = "Endpoints for managing emergency contacts and notification triggers")
public class EmergencyContactController {

    private final EmergencyContactService contactService;

    public EmergencyContactController(EmergencyContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    @Operation(summary = "Get list of emergency contacts")
    public ResponseEntity<ApiResponse<List<EmergencyContactDto>>> getContacts() {
        UUID userId = SecurityUtils.getCurrentUserId();
        List<EmergencyContactDto> list = contactService.getUserContacts(userId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    @Operation(summary = "Add an emergency contact")
    public ResponseEntity<ApiResponse<EmergencyContactDto>> createContact(
            @Valid @RequestBody CreateEmergencyContactRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        EmergencyContactDto contact = contactService.createContact(request, userId);
        return ResponseEntity.ok(ApiResponse.ok("Contact created", contact));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an emergency contact")
    public ResponseEntity<ApiResponse<EmergencyContactDto>> updateContact(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CreateEmergencyContactRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        EmergencyContactDto contact = contactService.updateContact(id, request, userId);
        return ResponseEntity.ok(ApiResponse.ok("Contact updated", contact));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an emergency contact")
    public ResponseEntity<ApiResponse<String>> deleteContact(@PathVariable("id") UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        contactService.deleteContact(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Contact deleted", "Removed"));
    }
}
