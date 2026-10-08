import apiClient from './client';
import { AssistanceProvider, ProviderType } from '../types';

export const providerApi = {
  getProviders: (providerType?: ProviderType): Promise<AssistanceProvider[]> => {
    const query = providerType ? `?providerType=${providerType}` : '';
    return apiClient<AssistanceProvider[]>(`/providers${query}`);
  },

  getPublicProviders: (providerType?: ProviderType): Promise<AssistanceProvider[]> => {
    const query = providerType ? `?providerType=${providerType}` : '';
    return apiClient<AssistanceProvider[]>(`/providers/public${query}`, { requiresAuth: false });
  },
};
