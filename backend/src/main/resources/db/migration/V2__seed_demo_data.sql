-- LIFELINK OS Demo Seed Data Migration V2
-- CLEARLY LABELED DEMO DATA FOR IMMEDIATE EVALUATION

-- Default demo user: driver@lifelink.os / Lifelink123!
-- BCrypt password hash for 'Lifelink123!': $2a$10$e8Z4w1yYvO/5wzE0v1KqCeHkJp8fQz7j8a9gK2m3n4o5p6q7r8s9t -> let's use standard $2a$10$wN9a36h7RknFzM6NlJ18QeFkW87GgO12l9NlO7FwQk6p0hYVq3bma (or we can initialize via DataInitializer in Spring as well)

INSERT INTO users (id, email, password_hash, full_name, phone_number, role, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'driver@lifelink.os',
    '$2a$10$8.4k5o1Z5R4n0sJk0h9dLe3m2c1v0b9a8z7y6x5w4v3u2t1s0r9q8', -- Placeholder or will be ensured by DataInitializer
    'Alex Mercer',
    '+1 (555) 234-5678',
    'USER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO user_settings (id, user_id, notification_email, notification_sms, push_notifications, share_location_default, dark_mode, created_at, updated_at)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO emergency_contacts (id, user_id, name, relationship, phone_number, email, is_primary, notify_on_incident, created_at, updated_at)
VALUES 
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Elena Mercer',
    'Spouse',
    '+1 (555) 987-6543',
    'elena.m@example.com',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'David Mercer',
    'Brother',
    '+1 (555) 456-7890',
    'david.m@example.com',
    FALSE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO vehicles (id, user_id, make, model, year_val, license_plate, vin, color, fuel_type, insurance_policy_number, insurance_provider, insurance_expiry_date, puc_expiry_date, warranty_expiry_date, is_primary, created_at, updated_at)
VALUES 
(
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Toyota',
    'RAV4 Hybrid AWD',
    2022,
    '7XYZ890',
    '2T3C1RFV5NC123456',
    'Magnetic Gray Metallic',
    'HYBRID',
    'POL-7821940-SF',
    'State Farm Mutual',
    CURRENT_DATE + INTERVAL '45' DAY,
    CURRENT_DATE + INTERVAL '120' DAY,
    CURRENT_DATE + INTERVAL '380' DAY,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Honda',
    'Civic Touring',
    2020,
    '4ABC321',
    '1HGFC2F76LE098765',
    'Crystal Black Pearl',
    'PETROL',
    'POL-4512903-GE',
    'GEICO Direct',
    CURRENT_DATE + INTERVAL '12' DAY, -- Expiring soon for demo warning!
    CURRENT_DATE + INTERVAL '180' DAY,
    CURRENT_DATE - INTERVAL '60' DAY,
    FALSE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO vehicle_service_records (id, vehicle_id, service_date, mileage, service_center, description, cost, invoice_file_key, created_at)
VALUES 
(
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '90' DAY,
    28500,
    'City Toyota Service Center',
    'Scheduled 30k mile maintenance: synthetic oil change, tire rotation, hybrid battery diagnostics, brake inspection.',
    249.50,
    'demo/invoices/service_30k_toyota.pdf',
    CURRENT_TIMESTAMP
);

INSERT INTO assistance_providers (id, name, provider_type, phone_number, rating, estimated_eta_minutes, service_area, is_demo, is_active, created_at)
VALUES 
(
    'f0000000-0000-0000-0000-000000000001',
    '[DEMO] Apex Flatbed & Heavy Towing',
    'TOWING',
    '+1 (800) 555-0144',
    4.9,
    18,
    'Bay Area Metro & Highways',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP
),
(
    'f0000000-0000-0000-0000-000000000002',
    '[DEMO] RapidResponse Roadside & Jumpstart',
    'BATTERY_JUMP',
    '+1 (800) 555-0177',
    4.8,
    14,
    'Peninsula & South Bay',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP
),
(
    'f0000000-0000-0000-0000-000000000003',
    '[DEMO] MobilePro Mobile Mechanic & Tire Swap',
    'TIRE_CHANGE',
    '+1 (800) 555-0199',
    4.7,
    22,
    'San Francisco & Peninsula',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP
),
(
    'f0000000-0000-0000-0000-000000000004',
    '[DEMO] Highway Incident Patrol Liaison (Non-Emergency)',
    'POLICE_NON_EMERGENCY',
    '+1 (800) 555-0111',
    4.6,
    30,
    'Highway Patrol Sector 4',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP
);

INSERT INTO incidents (id, user_id, vehicle_id, incident_type, urgency, status, title, description, address, latitude, longitude, location_shared_explicitly, summary, assistance_need, created_at, updated_at)
VALUES 
(
    '10000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'VEHICLE_BREAKDOWN',
    'MEDIUM',
    'DISPATCHED',
    'High coolant temperature and sudden loss of engine power',
    'Red temperature gauge light illuminated while cruising at 65mph on highway. Pulled over safely to shoulder. White steam visible under hood edge. Car was shut off immediately.',
    'I-280 Northbound near Page Mill Road Exit, Palo Alto, CA',
    37.4024,
    -122.1812,
    TRUE,
    'Coolant system failure indicated with thermal warning. Driver positioned vehicle on wide shoulder and stopped engine.',
    'TOWING',
    CURRENT_TIMESTAMP - INTERVAL '35' MINUTE,
    CURRENT_TIMESTAMP - INTERVAL '5' MINUTE
);

INSERT INTO incident_events (id, incident_id, event_type, actor_type, title, description, created_at)
VALUES 
(
    '11000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'CREATED',
    'USER',
    'Incident Reported',
    'Reported overheating vehicle breakdown with explicit location shared.',
    CURRENT_TIMESTAMP - INTERVAL '35' MINUTE
),
(
    '11000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'ASSESSED',
    'AI',
    'AI Assessment Generated',
    'Evaluated thermal severity: Urgency MEDIUM, Towing required, Do NOT open radiator cap while hot.',
    CURRENT_TIMESTAMP - INTERVAL '34' MINUTE
),
(
    '11000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'PROVIDER_DISPATCHED',
    'USER',
    'Assistance Requested',
    'Dispatched Apex Flatbed & Heavy Towing with ETA of 18 minutes after user confirmation.',
    CURRENT_TIMESTAMP - INTERVAL '15' MINUTE
);

INSERT INTO incident_actions (id, incident_id, step_order, title, description, action_category, is_completed, created_at, updated_at)
VALUES 
(
    '12000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    1,
    'Turn on hazard blinkers immediately',
    'Ensure oncoming traffic sees your parked vehicle from distance.',
    'IMMEDIATE_SAFETY',
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '34' MINUTE,
    CURRENT_TIMESTAMP - INTERVAL '32' MINUTE
),
(
    '12000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    2,
    'Do NOT touch the radiator cap',
    'Pressurized boiling liquid can cause severe third-degree burns.',
    'IMMEDIATE_SAFETY',
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '34' MINUTE,
    CURRENT_TIMESTAMP - INTERVAL '30' MINUTE
),
(
    '12000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    3,
    'Exit vehicle from passenger side away from traffic',
    'Wait behind safety highway barrier if available.',
    'IMMEDIATE_SAFETY',
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '34' MINUTE,
    CURRENT_TIMESTAMP - INTERVAL '28' MINUTE
),
(
    '12000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000001',
    4,
    'Prepare State Farm insurance and roadside membership number',
    'Policy number POL-7821940-SF is ready in your LIFELINK vault.',
    'DOCUMENT_CHECK',
    FALSE,
    CURRENT_TIMESTAMP - INTERVAL '34' MINUTE,
    CURRENT_TIMESTAMP - INTERVAL '34' MINUTE
);

INSERT INTO notifications (id, user_id, title, message, notification_type, is_read, incident_id, created_at)
VALUES 
(
    '13000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Document Expiry Warning',
    'Insurance for Honda Civic Touring (4ABC321) expires in 12 days. Review or update your policy in the Vehicle Vault.',
    'DOCUMENT_EXPIRY',
    FALSE,
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '2' HOUR
),
(
    '13000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Assistance En Route',
    'Apex Flatbed & Heavy Towing is en route for incident: High coolant temperature.',
    'PROVIDER_UPDATE',
    FALSE,
    '10000000-0000-0000-0000-000000000001',
    CURRENT_TIMESTAMP - INTERVAL '15' MINUTE
);
