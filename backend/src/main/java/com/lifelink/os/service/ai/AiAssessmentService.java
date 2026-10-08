package com.lifelink.os.service.ai;

import com.lifelink.os.dto.ai.IncidentAssessmentRequest;
import com.lifelink.os.dto.ai.IncidentAssessmentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AiAssessmentService {

    private static final Logger log = LoggerFactory.getLogger(AiAssessmentService.class);

    private final OpenAiAssessmentProvider openAiProvider;
    private final DeterministicFallbackAssessmentProvider fallbackProvider;

    public AiAssessmentService(
            OpenAiAssessmentProvider openAiProvider,
            DeterministicFallbackAssessmentProvider fallbackProvider) {
        this.openAiProvider = openAiProvider;
        this.fallbackProvider = fallbackProvider;
    }

    public IncidentAssessmentResponse assessIncident(IncidentAssessmentRequest request) {
        if (openAiProvider.isAvailable()) {
            try {
                log.info("Evaluating incident via OpenAI-compatible provider: {}", request.getIncidentType());
                IncidentAssessmentResponse response = openAiProvider.assess(request);
                validateSafetyGuards(response);
                return response;
            } catch (Exception e) {
                log.warn("OpenAI assessment encountered an issue, seamlessly engaging deterministic fallback: {}", e.getMessage());
            }
        } else {
            log.info("OpenAI API key not configured; using offline deterministic rules engine.");
        }

        IncidentAssessmentResponse fallbackResponse = fallbackProvider.assess(request);
        validateSafetyGuards(fallbackResponse);
        return fallbackResponse;
    }

    private void validateSafetyGuards(IncidentAssessmentResponse response) {
        if (response.getDisclaimer() == null || response.getDisclaimer().isBlank()) {
            response.setDisclaimer(DeterministicFallbackAssessmentProvider.STANDARD_SAFETY_DISCLAIMER);
        }
        // AI must NEVER trigger external actions by itself - it only provides guided suggestions
    }
}
