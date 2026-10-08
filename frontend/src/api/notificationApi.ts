import apiClient from './client';
import { NotificationItem } from '../types';

export const notificationApi = {
  getAll: (): Promise<NotificationItem[]> => {
    return apiClient<NotificationItem[]>('/notifications');
  },

  markAsRead: (id: string): Promise<any> => {
    return apiClient(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllAsRead: (): Promise<any> => {
    return apiClient('/notifications/read-all', { method: 'POST' });
  },
};
