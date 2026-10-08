import apiClient from './client';
import { IncidentAssessmentResponse } from '../types';

export const aiApi = {
  assess: (data: {
    incidentType: string;
    description: string;
    symptoms?: string[];
    vehicleDetails?: string;
    injuriesReported?: boolean;
    onActiveRoadway?: boolean;
    locationDescription?: string;
  }): Promise<IncidentAssessmentResponse> => {
    return apiClient<IncidentAssessmentResponse>('/ai/incident-assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
