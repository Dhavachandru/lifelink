# LIFELINK OS - REST API Reference & Specification

All endpoints are hosted at `/api/*` and return standard JSON payloads. OpenAPI 3.0 documentation and Swagger UI are accessible in development at:
`http://localhost:8080/swagger-ui.html` / `http://localhost:8080/v3/api-docs`.

---

## 1. Authentication & Security Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Log in with email/password (returns JWT + Refresh Token) | No |
| `POST` | `/api/auth/refresh` | Renew expired JWT using active refresh token | No |
| `POST` | `/api/auth/logout` | Revoke refresh token and invalidate session | Yes (Bearer JWT) |
| `GET` | `/api/users/me` | Fetch currently authenticated user profile | Yes (Bearer JWT) |

### Sample Response: `POST /api/auth/login`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "4df1c2d9-e93c-44bf-8027-fa8a1bf19ee1",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": "e4f8e5f2-9014-41d3-8c3b-5a1e2f3d4e5f",
      "email": "driver@lifelink.os",
      "fullName": "Alex Mercer",
      "phoneNumber": "+1 (555) 234-5678",
      "role": "USER"
    }
  }
}
```

---

## 2. Incident & Dynamic Protocol Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/incidents` | List user's incidents (sorted with active incidents first) |
| `GET` | `/api/incidents/{id}` | Get full incident detail, interactive checklist, and timeline |
| `POST` | `/api/incidents` | Create a new incident (triggers AI triage & checklist generation) |
| `PUT` | `/api/incidents/{id}/status` | Update incident status (`REPORTED`, `ASSESSED`, `DISPATCHED`, `RESOLVED`, `CANCELLED`) |
| `PUT` | `/api/incidents/{id}/actions/{actionId}` | Toggle interactive checklist action status (`COMPLETED` / `PENDING`) |
| `POST` | `/api/incidents/{id}/timeline` | Append notes or custom log entry to incident timeline |
| `POST` | `/api/incidents/{id}/attachments` | Upload photo evidence or accident documentation (multipart) |

### Sample Request: `POST /api/incidents`
```json
{
  "type": "BREAKDOWN",
  "category": "VEHICLE",
  "vehicleId": "b1a2c3d4-e5f6-7890-1234-56789abcdef0",
  "description": "Engine overheating with steam coming from radiator. Pulled over safely.",
  "symptoms": ["OVERHEATING", "SMOKE", "ENGINE_STALL"],
  "latitude": 37.7749,
  "longitude": -122.4194,
  "address": "Mile Marker 14, US-101 Northbound"
}
```

---

## 3. AI Incident Assessment & Triage

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/assess` | Run on-demand AI assessment (uses OpenAI LLM with deterministic fallback) |

### Sample Response: `POST /api/ai/assess`
```json
{
  "urgency": "HIGH",
  "summary": "Engine overheating on active highway shoulder. Immediate safety risks present.",
  "primaryRecommendation": "Turn off engine, pop hood latch only from cabin, and retreat behind safety guardrail.",
  "suggestedProviderType": "TOW_TRUCK",
  "immediateActions": [
    { "title": "Turn on Hazard Lights", "description": "Ensure vehicle is visible to oncoming traffic.", "required": true, "phase": "IMMEDIATE_SAFETY" },
    { "title": "Step Behind Guardrail", "description": "Never stand between vehicle and moving highway traffic.", "required": true, "phase": "IMMEDIATE_SAFETY" }
  ],
  "evidenceChecklist": [
    { "title": "Photo of Temperature Gauge", "description": "Document reading before engine cools.", "required": false, "phase": "EVIDENCE" }
  ],
  "disclaimer": "LIFELINK OS is a decision-support guide. If there is immediate fire or life hazard, call 911 / 112 immediately."
}
```

---

## 4. Vehicle Vault & Document Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/vehicles` | List all vehicles owned by authenticated user |
| `POST` | `/api/vehicles` | Register vehicle with VIN, plate, make, model, policy dates |
| `GET` | `/api/vehicles/{id}` | Get vehicle detail with service records and documents |
| `POST` | `/api/vehicles/{id}/documents` | Upload policy/PUC/warranty document (multipart) |
| `GET` | `/api/vehicles/{id}/documents/{docId}/download` | Stream protected document file (owner-authorized) |
| `POST` | `/api/vehicles/{id}/service-records` | Log maintenance or repair service record |

---

## 5. Assistance Providers & Dispatch

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/providers` | Query available emergency, towing, and roadside providers |
| `POST` | `/api/providers/dispatch` | Dispatch assistance request with incident linkage (Requires explicit 2-step confirmation) |

---

## 6. Emergency Contacts & Privacy Settings

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/emergency-contacts` | List user's registered emergency contacts |
| `POST` | `/api/emergency-contacts` | Add emergency contact (designate primary, relation, phone) |
| `DELETE` | `/api/emergency-contacts/{id}` | Remove emergency contact |
| `GET` | `/api/settings` | Get user privacy controls, consent, and notification preferences |
| `PUT` | `/api/settings` | Update preferences and notifications |
| `GET` | `/api/settings/export` | Download full GDPR JSON export of user's vault, history, and timeline |
| `DELETE` | `/api/settings/account` | Request deletion of user profile and all associated data |
