import apiClient from './client';
import { AuthResponse, User } from '../types';

export const authApi = {
  login: (email: string, password: string): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requiresAuth: false,
    });
  },

  register: (email: string, password: string, fullName: string, phoneNumber?: string): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, phoneNumber }),
      requiresAuth: false,
    });
  },

  logout: (): Promise<any> => {
    return apiClient('/auth/logout', { method: 'POST' });
  },

  getProfile: (): Promise<User> => {
    return apiClient<User>('/users/me');
  },

  updateProfile: (fullName: string, phoneNumber?: string): Promise<User> => {
    return apiClient<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ fullName, phoneNumber }),
    });
  },

  exportUserData: (): Promise<any> => {
    return apiClient<any>('/users/me/export');
  },
};
