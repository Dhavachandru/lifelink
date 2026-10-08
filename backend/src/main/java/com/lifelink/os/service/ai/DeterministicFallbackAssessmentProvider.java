package com.lifelink.os.service.ai;

import com.lifelink.os.domain.enums.IncidentType;
import com.lifelink.os.domain.enums.UrgencyLevel;
import com.lifelink.os.dto.ai.IncidentAssessmentRequest;
import com.lifelink.os.dto.ai.IncidentAssessmentResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class DeterministicFallbackAssessmentProvider implements AiAssessmentProvider {

    public static final String STANDARD_SAFETY_DISCLAIMER =
            "IMPORTANT: LIFELINK OS provides guided decision support and does NOT provide emergency response, medical diagnosis, or legal fault determination. If anyone is injured or there is imminent danger, immediately contact emergency services (911 / 112 / local police).";

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public IncidentAssessmentResponse assess(IncidentAssessmentRequest request) {
        IncidentAssessmentResponse response = new IncidentAssessmentResponse();
        response.setIncidentType(request.getIncidentType());
        response.setEvaluatedBy("LIFELINK_DETERMINISTIC_RULES_ENGINE");
        response.setDisclaimer(STANDARD_SAFETY_DISCLAIMER);

        String description = (request.getDescription() != null ? request.getDescription() : "").toLowerCase(Locale.ROOT);
        List<String> symptoms = request.getSymptoms() != null ? request.getSymptoms() : new ArrayList<>();
        String combinedText = description + " " + String.join(" ", symptoms).toLowerCase(Locale.ROOT);

        if (request.getIncidentType() == IncidentType.VEHICLE_ACCIDENT) {
            assessAccident(request, combinedText, response);
        } else if (request.getIncidentType() == IncidentType.VEHICLE_BREAKDOWN) {
            assessBreakdown(request, combinedText, response);
        } else {
            assessGeneral(request, combinedText, response);
        }

        return response;
    }

    private void assessAccident(IncidentAssessmentRequest request, String text, IncidentAssessmentResponse response) {
        boolean hasInjuries = request.isInjuriesReported() || text.contains("bleed") || text.contains("hurt") || text.contains("unconscious") || text.contains("pain") || text.contains("injury");
        boolean onHighway = request.isOnActiveRoadway() || text.contains("highway") || text.contains("freeway") || text.contains("interstate") || text.contains("middle of road");
        boolean fireOrSmoke = text.contains("fire") || text.contains("smoke") || text.contains("flame") || text.contains("gas leak");

        if (hasInjuries || fireOrSmoke) {
            response.setUrgency(UrgencyLevel.CRITICAL);
            response.setSummary("Critical accident detected. Primary priority is human life, medical dispatch, and personal safety.");
            response.setAssistanceNeed("EMERGENCY_SERVICES");

            response.getImmediateSafetySteps().add("IMMEDIATE: Call emergency services (911 / 112) right now. Report injuries and location.");
            if (fireOrSmoke) {
                response.getImmediateSafetySteps().add("Evacuate vehicle occupants to a safe distance upwind and off the roadway.");
            } else {
                response.getImmediateSafetySteps().add("Do NOT move injured passengers unless there is immediate risk of explosion or fire.");
            }
            response.getImmediateSafetySteps().add("Turn on hazard warning flashers if accessible without risk.");
            response.getImmediateSafetySteps().add("Wait behind highway barriers or off the road shoulder until emergency personnel arrive.");

            response.getRecommendedActions().add("Designate one calm person to speak with the emergency dispatcher.");
            response.getRecommendedActions().add("Note any mile markers, cross streets, or prominent landmarks.");
            response.getRecommendedActions().add("Only gather driver info or photos once authorized by emergency responders and when safe.");

            response.getClarifyingQuestions().add("Is anyone experiencing breathing difficulty, chest trauma, or neck/spine pain?");
            response.getClarifyingQuestions().add("Are vehicles blocking live traffic lanes?");

            response.getEvidenceToCollect().add("Collect photos and other party details ONLY after responders secure the scene and declare it safe.");
            response.getDocumentsToCheck().add("Vehicle Registration & Proof of Insurance Card (keep ready for responding officers).");
        } else {
            response.setUrgency(onHighway ? UrgencyLevel.HIGH : UrgencyLevel.MEDIUM);
            response.setSummary("Accident without immediate injuries reported. Priority is scene safety, traffic mitigation, and factual documentation.");
            response.setAssistanceNeed(text.contains("cannot drive") || text.contains("airbag") || text.contains("towed") ? "TOWING" : "POLICE_REPORT");

            response.getImmediateSafetySteps().add("Turn on hazard lights immediately.");
            if (onHighway) {
                response.getImmediateSafetySteps().add("If the vehicle can safely roll, pull onto the nearest shoulder or exit. Never stand in active highway lanes.");
                response.getImmediateSafetySteps().add("Remain behind guard rails or on the elevated berm away from traffic.");
            } else {
                response.getImmediateSafetySteps().add("Assess if the vehicles pose an active traffic hazard. Move to safe shoulder or parking lot if drivable.");
            }
            response.getImmediateSafetySteps().add("Check on all involved drivers and passengers calmly.");

            response.getRecommendedActions().add("Contact non-emergency police dispatch to file a formal traffic incident report.");
            response.getRecommendedActions().add("Exchange factual contact and insurance information with the other driver without discussing fault or liability.");
            response.getRecommendedActions().add("Request assistance from verified roadside towing if steering, axles, or fluids are compromised.");

            response.getClarifyingQuestions().add("Did airbags deploy?");
            response.getClarifyingQuestions().add("Is fluid leaking from underneath either vehicle?");

            response.getEvidenceToCollect().add("Clear photos of all 4 vehicle corners and point of impact.");
            response.getEvidenceToCollect().add("Photos of license plates, driver licenses, and insurance cards.");
            response.getEvidenceToCollect().add("Photos of street signs, signals, weather conditions, and skid marks.");
            response.getEvidenceToCollect().add("Names and contact numbers of any neutral witnesses.");

            response.getDocumentsToCheck().add("State Farm / Insurer Policy number and claims hotline.");
            response.getDocumentsToCheck().add("Vehicle Registration & Driver License.");
        }
    }

    private void assessBreakdown(IncidentAssessmentRequest request, String text, IncidentAssessmentResponse response) {
        boolean onHighway = request.isOnActiveRoadway() || text.contains("highway") || text.contains("freeway") || text.contains("fast lane");
        boolean flatTire = text.contains("tire") || text.contains("puncture") || text.contains("blowout") || text.contains("flat");
        boolean batteryDead = text.contains("battery") || text.contains("click") || text.contains("won't start") || text.contains("starter") || text.contains("jump");
        boolean overheat = text.contains("overheat") || text.contains("coolant") || text.contains("steam") || text.contains("temp gauge") || text.contains("radiator");
        boolean smokeOrFire = text.contains("smoke") || text.contains("fire") || text.contains("burning smell");

        if (smokeOrFire) {
            response.setUrgency(UrgencyLevel.CRITICAL);
            response.setAssistanceNeed("EMERGENCY_SERVICES");
            response.setSummary("Smoke or combustion odor detected. High risk of electrical or mechanical fire.");
            response.getImmediateSafetySteps().add("Turn off the ignition immediately.");
            response.getImmediateSafetySteps().add("Evacuate all passengers away from the vehicle (at least 100 feet upwind).");
            response.getImmediateSafetySteps().add("Do NOT open the hood if heavy smoke or flames are present.");
            response.getImmediateSafetySteps().add("Call fire & emergency dispatch.");
            response.getDocumentsToCheck().add("Vehicle insurance policy & warranty documentation.");
        } else if (overheat) {
            response.setUrgency(onHighway ? UrgencyLevel.HIGH : UrgencyLevel.MEDIUM);
            response.setAssistanceNeed("TOWING");
            response.setSummary("Thermal cooling system failure indicated. Operating engine while overheated causes severe head gasket and block damage.");
            response.getImmediateSafetySteps().add("Turn on hazard blinkers and steer gently to a safe shoulder.");
            response.getImmediateSafetySteps().add("Turn off the engine immediately to prevent engine seizure.");
            response.getImmediateSafetySteps().add("NEVER touch or remove the radiator cap or coolant reservoir when hot. High-pressure boiling steam causes severe burns.");
            response.getImmediateSafetySteps().add("Wait at least 30-45 minutes before inspecting fluid levels.");
            response.getRecommendedActions().add("Request a flatbed tow truck to take vehicle to certified repair center.");
            response.getRecommendedActions().add("Check for green, pink, or orange liquid puddles beneath front bumper.");
            response.getClarifyingQuestions().add("Did the temperature needle hit the red line, or did a digital warning chime?");
            response.getClarifyingQuestions().add("Is white sweet-smelling steam coming from front grill?");
            response.getEvidenceToCollect().add("Photo of dashboard instrument cluster showing temperature gauge and warning lights.");
            response.getEvidenceToCollect().add("Photo of any puddle under vehicle from safe distance.");
            response.getDocumentsToCheck().add("Vehicle warranty status and roadside assistance coverage.");
        } else if (flatTire) {
            response.setUrgency(onHighway ? UrgencyLevel.HIGH : UrgencyLevel.MEDIUM);
            response.setAssistanceNeed("TIRE_CHANGE");
            response.setSummary("Tire deflation or puncture identified. Driving on a flat tire damages wheel rims and suspension.");
            response.getImmediateSafetySteps().add("Grip steering wheel firmly and decelerate gradually without sudden hard braking.");
            response.getImmediateSafetySteps().add("Pull vehicle completely onto flat, level ground far from active lanes.");
            response.getImmediateSafetySteps().add("Apply emergency parking brake firmly.");
            if (onHighway) {
                response.getImmediateSafetySteps().add("If the flat is on the traffic side of the car, do NOT change it yourself on a busy highway. Request professional roadside assistance.");
            }
            response.getRecommendedActions().add("Verify if your vehicle is equipped with a spare donut tire, jack, and lug wrench, or an inflator kit.");
            response.getRecommendedActions().add("Request mobile tire patrol or roadside service if ground is uneven or unsafe.");
            response.getClarifyingQuestions().add("Is the vehicle located on a flat paved surface or an incline?");
            response.getClarifyingQuestions().add("Which specific tire is flat?");
            response.getEvidenceToCollect().add("Photo of damaged tire tread and sidewall.");
            response.getDocumentsToCheck().add("Tire road hazard warranty or roadside assistance policy.");
        } else if (batteryDead) {
            response.setUrgency(UrgencyLevel.LOW);
            response.setAssistanceNeed("BATTERY_JUMP");
            response.setSummary("Electrical or starter battery depletion. Vehicle fails to crank engine.");
            response.getImmediateSafetySteps().add("Turn off headlights, air conditioning, infotainment, and interior dome lights.");
            response.getImmediateSafetySteps().add("Ensure vehicle is completely in 'Park' (automatic) or 'Neutral' with clutch depressed.");
            response.getRecommendedActions().add("Inspect battery terminals for heavy white or blue corrosion powder.");
            response.getRecommendedActions().add("Request mobile battery jump patrol or use portable jump starter pack.");
            response.getClarifyingQuestions().add("Do the headlights turn on brightly or do they flicker dimly?");
            response.getClarifyingQuestions().add("How old is the current 12V battery?");
            response.getEvidenceToCollect().add("Photo of battery label showing CCA (Cold Cranking Amps) and date code.");
            response.getDocumentsToCheck().add("Battery replacement warranty or auto club membership card.");
        } else {
            response.setUrgency(onHighway ? UrgencyLevel.HIGH : UrgencyLevel.MEDIUM);
            response.setAssistanceNeed("MOBILE_MECHANIC");
            response.setSummary("Mechanical breakdown reported. Priority is driver safety and diagnostic triage.");
            response.getImmediateSafetySteps().add("Turn on hazard warning flashers.");
            response.getImmediateSafetySteps().add("Park on safe shoulder or parking bay away from active traffic.");
            response.getImmediateSafetySteps().add("Stay inside vehicle with seatbelt fastened if on a high-speed motorway without pedestrian barriers.");
            response.getRecommendedActions().add("Note any specific dashboard error codes or warning symbols (Check Engine, Oil, Transmission).");
            response.getRecommendedActions().add("Request mobile mechanic or towing based on severity.");
            response.getClarifyingQuestions().add("Does the car restart after sitting for 5 minutes?");
            response.getClarifyingQuestions().add("Were there strange noises (knocking, grinding, whistling) before stopping?");
            response.getEvidenceToCollect().add("Photo of warning lights on dashboard cluster.");
            response.getDocumentsToCheck().add("Vehicle registration and roadside assistance policy.");
        }
    }

    private void assessGeneral(IncidentAssessmentRequest request, String text, IncidentAssessmentResponse response) {
        response.setUrgency(UrgencyLevel.MEDIUM);
        response.setAssistanceNeed("NONE");
        response.setSummary("Incident reported under category: " + request.getIncidentType());
        response.getImmediateSafetySteps().add("Assess immediate surroundings for hazards.");
        response.getImmediateSafetySteps().add("Secure valuables and notify designated emergency contacts.");
        response.getRecommendedActions().add("Review relevant policy documents in your LIFELINK vault.");
        response.getEvidenceToCollect().add("Take timestamped photographs of any physical property or document issues.");
        response.getDocumentsToCheck().add("Relevant identity, insurance, or property coverage records.");
    }
}
