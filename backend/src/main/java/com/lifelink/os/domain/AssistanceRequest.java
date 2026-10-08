package com.lifelink.os.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assistance_requests")
public class AssistanceRequest {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "provider_id", nullable = false)
    private AssistanceProvider provider;

    @Column(name = "status", nullable = false)
    private String status = "REQUESTED";

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "provider_notes", columnDefinition = "TEXT")
    private String providerNotes;

    public AssistanceRequest() {
        this.id = UUID.randomUUID();
        this.requestedAt = LocalDateTime.now();
    }

    public AssistanceRequest(Incident incident, AssistanceProvider provider) {
        this();
        this.incident = incident;
        this.provider = provider;
        this.status = "DISPATCHED";
        this.confirmedAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Incident getIncident() { return incident; }
    public void setIncident(Incident incident) { this.incident = incident; }

    public AssistanceProvider getProvider() { return provider; }
    public void setProvider(AssistanceProvider provider) { this.provider = provider; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }

    public String getProviderNotes() { return providerNotes; }
    public void setProviderNotes(String providerNotes) { this.providerNotes = providerNotes; }
}
