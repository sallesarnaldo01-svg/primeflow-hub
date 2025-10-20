import { api } from './api';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  read_at?: string;
  data?: any;
  created_at: string;
}

export const notificationsService = {
  async list(unreadOnly = false) {
    return api.get<{ data: Notification[] }>(
      `/notifications${unreadOnly ? '?unread=true' : ''}`
    );
  },

  async markAsRead(id: string) {
    return api.put(`/notifications/${id}/read`, {});
  },

  async markAllAsRead() {
    return api.put('/notifications/read-all', {});
  },

  async delete(id: string) {
    return api.delete(`/notifications/${id}`);
  },

  async getUnreadCount() {
    return api.get<{ data: { count: number } }>('/notifications/unread/count');
  }
};
