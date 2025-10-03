import { api } from './api';

export interface InstagramConnection {
  id: string;
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  meta?: any;
}

export const instagramService = {
  async initiate(username: string, password: string, name?: string) {
    const { data } = await api.post<InstagramConnection>('/instagram/initiate', {
      username,
      password,
      name
    });
    return data;
  },

  async getAccounts(connectionId: string) {
    const { data } = await api.get(`/instagram/${connectionId}/accounts`);
    return data;
  },

  async sendBulk(
    connectionId: string,
    recipients: string[],
    message: string,
    delay?: number,
    jitter?: number
  ) {
    const { data } = await api.post(`/instagram/${connectionId}/bulk`, {
      recipients,
      message,
      delay,
      jitter
    });
    return data;
  },

  async disconnect(connectionId: string) {
    const { data } = await api.post(`/instagram/${connectionId}/disconnect`);
    return data;
  },

  async getStatus(connectionId: string) {
    const { data } = await api.get<InstagramConnection>(`/instagram/${connectionId}/status`);
    return data;
  }
};
