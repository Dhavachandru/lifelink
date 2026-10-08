package com.lifelink.os.service.ai;

import com.lifelink.os.dto.ai.IncidentAssessmentRequest;
import com.lifelink.os.dto.ai.IncidentAssessmentResponse;

public interface AiAssessmentProvider {
    IncidentAssessmentResponse assess(IncidentAssessmentRequest request);
    boolean isAvailable();
}
