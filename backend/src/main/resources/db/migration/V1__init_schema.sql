-- LIFELINK OS Database Schema Migration V1
-- Supports UUID primary keys, timestamps, foreign keys, indexes

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    notify_on_incident BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emergency_contacts_user ON emergency_contacts(user_id);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year_val INT NOT NULL,
    license_plate VARCHAR(50) NOT NULL,
    vin VARCHAR(100),
    color VARCHAR(50),
    fuel_type VARCHAR(50) DEFAULT 'PETROL',
    insurance_policy_number VARCHAR(100),
    insurance_provider VARCHAR(100),
    insurance_expiry_date DATE,
    puc_expiry_date DATE,
    warranty_expiry_date DATE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_user ON vehicles(user_id);
CREATE INDEX idx_vehicles_plate ON vehicles(license_plate);

CREATE TABLE vehicle_documents (
    id UUID PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- INSURANCE, PUC, REGISTRATION, WARRANTY, SERVICE_INVOICE, OTHER
    document_number VARCHAR(100),
    expiry_date DATE,
    file_key VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicle_documents_vehicle ON vehicle_documents(vehicle_id);

CREATE TABLE vehicle_service_records (
    id UUID PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    mileage INT,
    service_center VARCHAR(255),
    description TEXT NOT NULL,
    cost DECIMAL(10, 2),
    invoice_file_key VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_records_vehicle ON vehicle_service_records(vehicle_id);

CREATE TABLE incidents (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    incident_type VARCHAR(50) NOT NULL, -- VEHICLE_BREAKDOWN, VEHICLE_ACCIDENT, HOME, TRAVEL, DOCUMENTS, DEVICE
    urgency VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- CRITICAL, HIGH, MEDIUM, LOW
    status VARCHAR(50) NOT NULL DEFAULT 'REPORTED', -- REPORTED, ASSESSING, DISPATCHED, RESOLVING, RESOLVED, CANCELLED
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    address VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_shared_explicitly BOOLEAN NOT NULL DEFAULT FALSE,
    summary TEXT,
    assistance_need VARCHAR(100) DEFAULT 'NONE',
    ai_assessment_json TEXT,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incidents_user ON incidents(user_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_type ON incidents(incident_type);

CREATE TABLE incident_events (
    id UUID PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- CREATED, ASSESSED, STATUS_CHANGED, NOTE_ADDED, PROVIDER_DISPATCHED, ATTACHMENT_ADDED, RESOLVED
    actor_type VARCHAR(50) NOT NULL DEFAULT 'USER', -- USER, SYSTEM, AI, PROVIDER
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incident_events_incident ON incident_events(incident_id);

CREATE TABLE incident_actions (
    id UUID PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    action_category VARCHAR(50) NOT NULL, -- IMMEDIATE_SAFETY, RECOMMENDED_ACTION, EVIDENCE_COLLECTION, DOCUMENT_CHECK
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incident_actions_incident ON incident_actions(incident_id);

CREATE TABLE assistance_providers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(50) NOT NULL, -- TOWING, BATTERY_JUMP, TIRE_CHANGE, MOBILE_MECHANIC, EMERGENCY_MEDICAL_HOTLINE, POLICE_NON_EMERGENCY
    phone_number VARCHAR(50) NOT NULL,
    rating DOUBLE PRECISION DEFAULT 4.8,
    estimated_eta_minutes INT DEFAULT 25,
    service_area VARCHAR(100) DEFAULT 'METRO_METROPOLITAN',
    is_demo BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assistance_requests (
    id UUID PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES assistance_providers(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED', -- REQUESTED, CONFIRMED, DISPATCHED, ON_SCENE, COMPLETED, CANCELLED
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    provider_notes TEXT
);

CREATE INDEX idx_assistance_requests_incident ON assistance_requests(incident_id);

CREATE TABLE incident_attachments (
    id UUID PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    file_key VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    attachment_type VARCHAR(50) NOT NULL DEFAULT 'PHOTO', -- PHOTO, DOCUMENT, AUDIO, DAMAGE_EVIDENCE
    notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incident_attachments_incident ON incident_attachments(incident_id);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- INCIDENT_ALERT, DOCUMENT_EXPIRY, PROVIDER_UPDATE, SYSTEM
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

CREATE TABLE user_settings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    notification_email BOOLEAN NOT NULL DEFAULT TRUE,
    notification_sms BOOLEAN NOT NULL DEFAULT FALSE,
    push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    share_location_default BOOLEAN NOT NULL DEFAULT FALSE,
    dark_mode BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);
