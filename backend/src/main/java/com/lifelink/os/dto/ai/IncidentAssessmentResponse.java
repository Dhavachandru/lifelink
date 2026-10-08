package com.lifelink.os.dto.ai;

import com.lifelink.os.domain.enums.IncidentType;
import com.lifelink.os.domain.enums.UrgencyLevel;
import java.util.ArrayList;
import java.util.List;

public class IncidentAssessmentResponse {
    private IncidentType incidentType;
    private UrgencyLevel urgency;
    private String summary;
    private List<String> immediateSafetySteps = new ArrayList<>();
    private List<String> recommendedActions = new ArrayList<>();
    private List<String> clarifyingQuestions = new ArrayList<>();
    private List<String> evidenceToCollect = new ArrayList<>();
    private List<String> documentsToCheck = new ArrayList<>();
    private String assistanceNeed; // TOWING, MOBILE_MECHANIC, BATTERY_JUMP, TIRE_CHANGE, EMERGENCY_SERVICES, POLICE_REPORT, NONE
    private String disclaimer;
    private String evaluatedBy = "LIFELINK_AI_ENGINE";

    public IncidentAssessmentResponse() {}

    public IncidentType getIncidentType() { return incidentType; }
    public void setIncidentType(IncidentType incidentType) { this.incidentType = incidentType; }

    public UrgencyLevel getUrgency() { return urgency; }
    public void setUrgency(UrgencyLevel urgency) { this.urgency = urgency; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getImmediateSafetySteps() { return immediateSafetySteps; }
    public void setImmediateSafetySteps(List<String> immediateSafetySteps) { this.immediateSafetySteps = immediateSafetySteps; }

    public List<String> getRecommendedActions() { return recommendedActions; }
    public void setRecommendedActions(List<String> recommendedActions) { this.recommendedActions = recommendedActions; }

    public List<String> getClarifyingQuestions() { return clarifyingQuestions; }
    public void setClarifyingQuestions(List<String> clarifyingQuestions) { this.clarifyingQuestions = clarifyingQuestions; }

    public List<String> getEvidenceToCollect() { return evidenceToCollect; }
    public void setEvidenceToCollect(List<String> evidenceToCollect) { this.evidenceToCollect = evidenceToCollect; }

    public List<String> getDocumentsToCheck() { return documentsToCheck; }
    public void setDocumentsToCheck(List<String> documentsToCheck) { this.documentsToCheck = documentsToCheck; }

    public String getAssistanceNeed() { return assistanceNeed; }
    public void setAssistanceNeed(String assistanceNeed) { this.assistanceNeed = assistanceNeed; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }

    public String getEvaluatedBy() { return evaluatedBy; }
    public void setEvaluatedBy(String evaluatedBy) { this.evaluatedBy = evaluatedBy; }
}
