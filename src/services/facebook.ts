import { api } from './api';

export interface FacebookConnection {
  id: string;
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  meta?: any;
}

export const facebookService = {
  async initiate(email: string, password: string, name?: string) {
    const { data } = await api.post<FacebookConnection>('/facebook/initiate', {
      email,
      password,
      name
    });
    return data;
  },

  async getPages(connectionId: string) {
    const { data } = await api.get(`/facebook/${connectionId}/pages`);
    return data;
  },

  async sendBulk(
    connectionId: string,
    recipients: string[],
    message: string,
    delay?: number,
    jitter?: number
  ) {
    const { data } = await api.post(`/facebook/${connectionId}/bulk`, {
      recipients,
      message,
      delay,
      jitter
    });
    return data;
  },

  async disconnect(connectionId: string) {
    const { data } = await api.post(`/facebook/${connectionId}/disconnect`);
    return data;
  },

  async getStatus(connectionId: string) {
    const { data } = await api.get<FacebookConnection>(`/facebook/${connectionId}/status`);
    return data;
  }
};
