import apiClient from './client';
import { UserSettings } from '../types';

export const settingsApi = {
  getSettings: (): Promise<UserSettings> => {
    return apiClient<UserSettings>('/settings');
  },

  updateSettings: (data: Partial<UserSettings>): Promise<UserSettings> => {
    return apiClient<UserSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
