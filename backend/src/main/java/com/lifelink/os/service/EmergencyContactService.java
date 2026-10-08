package com.lifelink.os.service;

import com.lifelink.os.domain.EmergencyContact;
import com.lifelink.os.domain.User;
import com.lifelink.os.dto.contact.CreateEmergencyContactRequest;
import com.lifelink.os.dto.contact.EmergencyContactDto;
import com.lifelink.os.exception.ResourceNotFoundException;
import com.lifelink.os.repository.EmergencyContactRepository;
import com.lifelink.os.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmergencyContactService {

    private final EmergencyContactRepository contactRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public EmergencyContactService(
            EmergencyContactRepository contactRepository,
            UserRepository userRepository,
            AuditLogService auditLogService) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<EmergencyContactDto> getUserContacts(UUID userId) {
        return contactRepository.findByUserIdOrderByIsPrimaryDescCreatedAtAsc(userId)
                .stream()
                .map(EmergencyContactDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmergencyContactDto createContact(CreateEmergencyContactRequest req, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (req.isPrimary()) {
            contactRepository.findByUserIdOrderByIsPrimaryDescCreatedAtAsc(userId)
                    .forEach(c -> {
                        if (c.isPrimary()) {
                            c.setPrimary(false);
                            contactRepository.save(c);
                        }
                    });
        }

        EmergencyContact contact = new EmergencyContact();
        contact.setUser(user);
        contact.setName(req.getName().trim());
        contact.setRelationship(req.getRelationship().trim());
        contact.setPhoneNumber(req.getPhoneNumber().trim());
        contact.setEmail(req.getEmail() != null ? req.getEmail().trim() : null);
        contact.setPrimary(req.isPrimary());
        contact.setNotifyOnIncident(req.isNotifyOnIncident());

        EmergencyContact saved = contactRepository.save(contact);
        auditLogService.logAction(userId, "CONTACT_CREATED", "CONTACT", saved.getId().toString(), "Added contact: " + saved.getName(), null);

        return EmergencyContactDto.fromEntity(saved);
    }

    @Transactional
    public EmergencyContactDto updateContact(UUID contactId, CreateEmergencyContactRequest req, UUID userId) {
        EmergencyContact contact = contactRepository.findByIdAndUserId(contactId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found or unauthorized"));

        if (req.isPrimary() && !contact.isPrimary()) {
            contactRepository.findByUserIdOrderByIsPrimaryDescCreatedAtAsc(userId)
                    .forEach(c -> {
                        if (c.isPrimary()) {
                            c.setPrimary(false);
                            contactRepository.save(c);
                        }
                    });
        }

        contact.setName(req.getName().trim());
        contact.setRelationship(req.getRelationship().trim());
        contact.setPhoneNumber(req.getPhoneNumber().trim());
        contact.setEmail(req.getEmail() != null ? req.getEmail().trim() : null);
        contact.setPrimary(req.isPrimary());
        contact.setNotifyOnIncident(req.isNotifyOnIncident());

        EmergencyContact saved = contactRepository.save(contact);
        auditLogService.logAction(userId, "CONTACT_UPDATED", "CONTACT", saved.getId().toString(), "Updated contact: " + saved.getName(), null);

        return EmergencyContactDto.fromEntity(saved);
    }

    @Transactional
    public void deleteContact(UUID contactId, UUID userId) {
        EmergencyContact contact = contactRepository.findByIdAndUserId(contactId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found or unauthorized"));

        contactRepository.delete(contact);
        auditLogService.logAction(userId, "CONTACT_DELETED", "CONTACT", contactId.toString(), "Deleted contact", null);
    }
}
