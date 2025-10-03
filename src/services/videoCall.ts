import { api } from './api';

export interface VideoCallRoom {
  id: string;
  teamId: string;
  roomId: string;
  topic: string;
  startedAt: string;
  endedAt?: string;
  participants: string[];
  token: string;
  jitsiUrl: string;
}

export const videoCallService = {
  async createRoom(teamId: string, topic: string, participants: string[]) {
    const { data } = await api.post<VideoCallRoom>('/video-call/create', {
      teamId,
      topic,
      participants
    });
    return data;
  },

  async endCall(id: string) {
    const { data } = await api.post(`/video-call/${id}/end`);
    return data;
  },

  async listCalls(teamId?: string) {
    const { data } = await api.get('/video-call', {
      params: { teamId }
    });
    return data;
  }
};
