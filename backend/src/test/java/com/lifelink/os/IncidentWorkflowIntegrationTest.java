package com.lifelink.os;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifelink.os.domain.enums.IncidentType;
import com.lifelink.os.domain.enums.UrgencyLevel;
import com.lifelink.os.dto.auth.LoginRequest;
import com.lifelink.os.dto.incident.CreateIncidentRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class IncidentWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("End-to-end incident lifecycle: Login -> Report Incident -> AI Actions Generated -> Fetch Detail")
    void testIncidentLifecycle() throws Exception {
        // 1. Authenticate with seeded demo account
        LoginRequest loginReq = new LoginRequest("driver@lifelink.os", "Lifelink123!");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        // 2. Report a new Breakdown incident
        CreateIncidentRequest incReq = new CreateIncidentRequest();
        incReq.setIncidentType(IncidentType.VEHICLE_BREAKDOWN);
        incReq.setTitle("Transmission shudder and check engine light");
        incReq.setDescription("Vehicle started violently vibrating when accelerating past 40 mph on highway.");
        incReq.setAddress("Highway 101 South, Mile Marker 42");
        incReq.setSymptoms(List.of("vibration", "transmission slip"));
        incReq.setLocationSharedExplicitly(false);

        MvcResult createResult = mockMvc.perform(post("/api/incidents")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(incReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Transmission shudder and check engine light"))
                .andExpect(jsonPath("$.data.actions").isArray())
                .andReturn();

        String incidentId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 3. Fetch incident detail and verify actions checklist is populated
        mockMvc.perform(get("/api/incidents/" + incidentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(incidentId))
                .andExpect(jsonPath("$.data.events").isArray());

        // 4. Verify unauthenticated access is forbidden
        mockMvc.perform(get("/api/incidents/" + incidentId))
                .andExpect(status().isForbidden());
    }
}
