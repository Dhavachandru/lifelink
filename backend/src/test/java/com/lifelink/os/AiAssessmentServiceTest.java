package com.lifelink.os;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifelink.os.domain.enums.IncidentType;
import com.lifelink.os.domain.enums.UrgencyLevel;
import com.lifelink.os.dto.ai.IncidentAssessmentRequest;
import com.lifelink.os.dto.ai.IncidentAssessmentResponse;
import com.lifelink.os.service.ai.AiAssessmentService;
import com.lifelink.os.service.ai.DeterministicFallbackAssessmentProvider;
import com.lifelink.os.service.ai.OpenAiAssessmentProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AiAssessmentServiceTest {

    private AiAssessmentService aiAssessmentService;

    @BeforeEach
    void setUp() {
        DeterministicFallbackAssessmentProvider fallbackProvider = new DeterministicFallbackAssessmentProvider();
        OpenAiAssessmentProvider openAiProvider = new OpenAiAssessmentProvider("", "", "gpt-4o-mini", new ObjectMapper());
        aiAssessmentService = new AiAssessmentService(openAiProvider, fallbackProvider);
    }

    @Test
    @DisplayName("Accident with injuries must trigger CRITICAL urgency and call 911 step")
    void testAccidentWithInjuriesTriagedCritical() {
        IncidentAssessmentRequest req = new IncidentAssessmentRequest();
        req.setIncidentType(IncidentType.VEHICLE_ACCIDENT);
        req.setDescription("Two car collision at intersection. Passenger is bleeding from forehead.");
        req.setInjuriesReported(true);

        IncidentAssessmentResponse res = aiAssessmentService.assessIncident(req);

        assertNotNull(res);
        assertEquals(UrgencyLevel.CRITICAL, res.getUrgency());
        assertEquals("EMERGENCY_SERVICES", res.getAssistanceNeed());
        assertTrue(res.getImmediateSafetySteps().stream().anyMatch(step -> step.contains("911") || step.contains("emergency")));
        assertNotNull(res.getDisclaimer());
        assertTrue(res.getDisclaimer().contains("does NOT provide emergency response"));
    }

    @Test
    @DisplayName("Engine overheating breakdown must advise against opening hot radiator cap")
    void testOverheatingBreakdownSafetyGuidance() {
        IncidentAssessmentRequest req = new IncidentAssessmentRequest();
        req.setIncidentType(IncidentType.VEHICLE_BREAKDOWN);
        req.setDescription("Engine temp gauge pinned in the red, steam hissing from under the hood.");
        req.setSymptoms(List.of("steam", "overheating", "high temperature"));

        IncidentAssessmentResponse res = aiAssessmentService.assessIncident(req);

        assertNotNull(res);
        assertEquals("TOWING", res.getAssistanceNeed());
        assertTrue(res.getImmediateSafetySteps().stream().anyMatch(step -> step.toLowerCase().contains("radiator cap") || step.toLowerCase().contains("steam")));
        assertFalse(res.getRecommendedActions().isEmpty());
    }

    @Test
    @DisplayName("Flat tire on highway must prioritize roadside safety")
    void testFlatTireOnHighwaySafety() {
        IncidentAssessmentRequest req = new IncidentAssessmentRequest();
        req.setIncidentType(IncidentType.VEHICLE_BREAKDOWN);
        req.setDescription("Rear right tire blew out on Interstate 280 shoulder.");
        req.setOnActiveRoadway(true);
        req.setSymptoms(List.of("flat tire", "blowout"));

        IncidentAssessmentResponse res = aiAssessmentService.assessIncident(req);

        assertNotNull(res);
        assertEquals("TIRE_CHANGE", res.getAssistanceNeed());
        assertTrue(res.getUrgency() == UrgencyLevel.HIGH || res.getUrgency() == UrgencyLevel.MEDIUM);
        assertTrue(res.getImmediateSafetySteps().stream().anyMatch(step -> step.toLowerCase().contains("hazard") || step.toLowerCase().contains("shoulder") || step.toLowerCase().contains("highway")));
    }
}
