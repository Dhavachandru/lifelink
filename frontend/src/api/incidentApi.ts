import apiClient from './client';
import { Incident, IncidentDetail, IncidentAttachment, AssistanceRequest } from '../types';

export const incidentApi = {
  getAll: (): Promise<Incident[]> => {
    return apiClient<Incident[]>('/incidents');
  },

  getById: (id: string): Promise<IncidentDetail> => {
    return apiClient<IncidentDetail>(`/incidents/${id}`);
  },

  create: (data: {
    vehicleId?: string;
    incidentType: string;
    title: string;
    description: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    locationSharedExplicitly?: boolean;
    symptoms?: string[];
    injuriesReported?: boolean;
    onActiveRoadway?: boolean;
  }): Promise<IncidentDetail> => {
    return apiClient<IncidentDetail>('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStatus: (id: string, status: string, resolutionNotes?: string): Promise<IncidentDetail> => {
    return apiClient<IncidentDetail>(`/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNotes }),
    });
  },

  addNote: (id: string, title: string, description?: string): Promise<IncidentDetail> => {
    return apiClient<IncidentDetail>(`/incidents/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  },

  toggleAction: (incidentId: string, actionId: string): Promise<any> => {
    return apiClient(`/incidents/${incidentId}/actions/${actionId}/toggle`, {
      method: 'PATCH',
    });
  },

  uploadAttachment: (incidentId: string, file: File, attachmentType = 'PHOTO', notes?: string): Promise<IncidentAttachment> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('attachmentType', attachmentType);
    if (notes) formData.append('notes', notes);

    return apiClient<IncidentAttachment>(`/incidents/${incidentId}/attachments`, {
      method: 'POST',
      body: formData,
    });
  },

  requestAssistance: (incidentId: string, providerId: string, notes?: string): Promise<AssistanceRequest> => {
    return apiClient<AssistanceRequest>(`/incidents/${incidentId}/assistance`, {
      method: 'POST',
      body: JSON.stringify({ providerId, notes }),
    });
  },

  getAssistanceRequests: (incidentId: string): Promise<AssistanceRequest[]> => {
    return apiClient<AssistanceRequest[]>(`/incidents/${incidentId}/assistance`);
  },
};
