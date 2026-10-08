import apiClient from './client';
import { EmergencyContact } from '../types';

export const contactApi = {
  getAll: (): Promise<EmergencyContact[]> => {
    return apiClient<EmergencyContact[]>('/emergency-contacts');
  },

  create: (data: {
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
    primary?: boolean;
    notifyOnIncident?: boolean;
  }): Promise<EmergencyContact> => {
    return apiClient<EmergencyContact>('/emergency-contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: Partial<EmergencyContact>): Promise<EmergencyContact> => {
    return apiClient<EmergencyContact>(`/emergency-contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (id: string): Promise<any> => {
    return apiClient(`/emergency-contacts/${id}`, { method: 'DELETE' });
  },
};
