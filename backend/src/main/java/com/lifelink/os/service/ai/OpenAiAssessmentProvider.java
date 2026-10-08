package com.lifelink.os.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifelink.os.domain.enums.IncidentType;
import com.lifelink.os.domain.enums.UrgencyLevel;
import com.lifelink.os.dto.ai.IncidentAssessmentRequest;
import com.lifelink.os.dto.ai.IncidentAssessmentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class OpenAiAssessmentProvider implements AiAssessmentProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAiAssessmentProvider.class);

    private final String apiKey;
    private final String baseUrl;
    private final String model;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OpenAiAssessmentProvider(
            @Value("${ai.openai.api-key:}") String apiKey,
            @Value("${ai.openai.base-url:https://api.openai.com/v1}") String baseUrl,
            @Value("${ai.openai.model:gpt-4o-mini}") String model,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.baseUrl = baseUrl != null ? baseUrl.trim() : "https://api.openai.com/v1";
        this.model = model != null ? model.trim() : "gpt-4o-mini";
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean isAvailable() {
        return !apiKey.isEmpty() && !apiKey.equalsIgnoreCase("none") && !apiKey.equalsIgnoreCase("placeholder");
    }

    @Override
    public IncidentAssessmentResponse assess(IncidentAssessmentRequest request) {
        if (!isAvailable()) {
            throw new IllegalStateException("OpenAI API key is not configured");
        }

        try {
            String systemPrompt = """
                You are LIFELINK OS, an intelligent incident triage assistant.
                Your promise is: "When something goes wrong, know what to do next."
                CRITICAL SAFETY RULES:
                1. If there are injuries, imminent fire/danger, or high-speed active roadway hazards, mark urgency CRITICAL and tell user immediately to call 911 / 112 / emergency services.
                2. NEVER determine legal fault or provide legal advice.
                3. NEVER provide definitive medical diagnosis.
                4. Suggest evidence collection (photos, driver details) ONLY when safe to do so.
                5. Do NOT trigger or claim to trigger any external dispatch directly.
                
                You MUST return ONLY valid JSON in the following schema:
                {
                  "incidentType": "%s",
                  "urgency": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
                  "summary": "concise situational summary",
                  "immediateSafetySteps": ["step 1", "step 2"],
                  "recommendedActions": ["action 1", "action 2"],
                  "clarifyingQuestions": ["question 1"],
                  "evidenceToCollect": ["evidence 1"],
                  "documentsToCheck": ["document 1"],
                  "assistanceNeed": "TOWING" | "MOBILE_MECHANIC" | "BATTERY_JUMP" | "TIRE_CHANGE" | "EMERGENCY_SERVICES" | "POLICE_REPORT" | "NONE",
                  "disclaimer": "LIFELINK OS does not provide emergency response, medical diagnosis, or legal fault determination. Contact local emergency services when needed."
                }
                """.formatted(request.getIncidentType().name());

            String userContent = String.format(
                    "Incident Type: %s\nDescription: %s\nSymptoms: %s\nVehicle Details: %s\nInjuries Reported: %s\nOn Active Roadway: %s\nLocation Description: %s",
                    request.getIncidentType(),
                    request.getDescription(),
                    request.getSymptoms() != null ? String.join(", ", request.getSymptoms()) : "None",
                    request.getVehicleDetails() != null ? request.getVehicleDetails() : "Unknown",
                    request.isInjuriesReported(),
                    request.isOnActiveRoadway(),
                    request.getLocationDescription() != null ? request.getLocationDescription() : "Unspecified"
            );

            Map<String, Object> body = new HashMap<>();
            body.put("model", this.model);
            body.put("temperature", 0.2);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.add(Map.of("role", "user", "content", userContent));
            body.put("messages", messages);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(this.apiKey);

            HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(body, headers);
            String url = this.baseUrl.replaceAll("/+$", "") + "/chat/completions";

            String responseBody = restTemplate.postForObject(url, httpEntity, String.class);
            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("choices").get(0).path("message").path("content").asText();

            // Extract JSON block if surrounded by markdown code block
            if (content.contains("```json")) {
                content = content.substring(content.indexOf("```json") + 7);
                if (content.contains("```")) {
                    content = content.substring(0, content.indexOf("```"));
                }
            } else if (content.contains("```")) {
                content = content.substring(content.indexOf("```") + 3);
                if (content.contains("```")) {
                    content = content.substring(0, content.indexOf("```"));
                }
            }

            JsonNode parsed = objectMapper.readTree(content.trim());
            IncidentAssessmentResponse assessment = new IncidentAssessmentResponse();
            assessment.setIncidentType(request.getIncidentType());
            assessment.setUrgency(UrgencyLevel.valueOf(parsed.path("urgency").asText("MEDIUM").toUpperCase()));
            assessment.setSummary(parsed.path("summary").asText("Incident assessed."));
            assessment.setAssistanceNeed(parsed.path("assistanceNeed").asText("NONE"));
            assessment.setDisclaimer(parsed.path("disclaimer").asText(DeterministicFallbackAssessmentProvider.STANDARD_SAFETY_DISCLAIMER));
            assessment.setEvaluatedBy("OPENAI_" + this.model);

            if (parsed.has("immediateSafetySteps")) {
                parsed.path("immediateSafetySteps").forEach(n -> assessment.getImmediateSafetySteps().add(n.asText()));
            }
            if (parsed.has("recommendedActions")) {
                parsed.path("recommendedActions").forEach(n -> assessment.getRecommendedActions().add(n.asText()));
            }
            if (parsed.has("clarifyingQuestions")) {
                parsed.path("clarifyingQuestions").forEach(n -> assessment.getClarifyingQuestions().add(n.asText()));
            }
            if (parsed.has("evidenceToCollect")) {
                parsed.path("evidenceToCollect").forEach(n -> assessment.getEvidenceToCollect().add(n.asText()));
            }
            if (parsed.has("documentsToCheck")) {
                parsed.path("documentsToCheck").forEach(n -> assessment.getDocumentsToCheck().add(n.asText()));
            }

            return assessment;
        } catch (Exception e) {
            log.warn("OpenAI assessment failed, delegating to fallback: {}", e.getMessage());
            throw new RuntimeException("OpenAI call failed", e);
        }
    }
}
