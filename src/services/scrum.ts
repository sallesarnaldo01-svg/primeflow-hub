import { api } from './api';

export interface ScrumTeam {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export interface Sprint {
  id: string;
  teamId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
  goal?: string;
  totalStoryPoints: number;
  completedStoryPoints: number;
}

export interface BacklogItem {
  id: string;
  type: 'STORY' | 'BUG' | 'TASK';
  title: string;
  description: string;
  points: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee?: string;
  epic?: string;
  sprintId?: string;
}

export interface Ceremony {
  id: string;
  teamId: string;
  name: string;
  type: 'DAILY' | 'PLANNING' | 'REVIEW' | 'RETROSPECTIVE';
  scheduledAt: string;
  duration: number;
  participants: string[];
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export const scrumService = {
  // Teams
  async listTeams() {
    const { data } = await api.get<ScrumTeam[]>('/scrum/teams');
    return data;
  },

  async createTeam(team: Omit<ScrumTeam, 'id' | 'createdAt'>) {
    const { data } = await api.post<ScrumTeam>('/scrum/teams', team);
    return data;
  },

  async updateTeam(id: string, team: Partial<ScrumTeam>) {
    const { data } = await api.put<ScrumTeam>(`/scrum/teams/${id}`, team);
    return data;
  },

  // Sprints
  async listSprints(teamId?: string) {
    const { data } = await api.get<Sprint[]>('/scrum/sprints', {
      params: { teamId }
    });
    return data;
  },

  async createSprint(sprint: Omit<Sprint, 'id' | 'completedStoryPoints'>) {
    const { data } = await api.post<Sprint>('/scrum/sprints', sprint);
    return data;
  },

  async updateSprint(id: string, sprint: Partial<Sprint>) {
    const { data } = await api.put<Sprint>(`/scrum/sprints/${id}`, sprint);
    return data;
  },

  async deleteSprint(id: string) {
    await api.delete(`/scrum/sprints/${id}`);
  },

  // Backlog
  async listBacklog(sprintId?: string) {
    const { data } = await api.get<BacklogItem[]>('/scrum/backlog', {
      params: { sprintId }
    });
    return data;
  },

  async createBacklogItem(item: Omit<BacklogItem, 'id'>) {
    const { data } = await api.post<BacklogItem>('/scrum/backlog', item);
    return data;
  },

  async updateBacklogItem(id: string, item: Partial<BacklogItem>) {
    const { data } = await api.put<BacklogItem>(`/scrum/backlog/${id}`, item);
    return data;
  },

  async moveBacklogItem(id: string, status: BacklogItem['status']) {
    const { data } = await api.put<BacklogItem>(`/scrum/backlog/${id}/status`, {
      status
    });
    return data;
  },

  async deleteBacklogItem(id: string) {
    await api.delete(`/scrum/backlog/${id}`);
  },

  // Ceremonies
  async listCeremonies(teamId?: string) {
    const { data } = await api.get<Ceremony[]>('/scrum/ceremonies', {
      params: { teamId }
    });
    return data;
  },

  async createCeremony(ceremony: Omit<Ceremony, 'id' | 'status'>) {
    const { data } = await api.post<Ceremony>('/scrum/ceremonies', ceremony);
    return data;
  },

  async updateCeremony(id: string, ceremony: Partial<Ceremony>) {
    const { data } = await api.put<Ceremony>(`/scrum/ceremonies/${id}`, ceremony);
    return data;
  },

  async startCeremony(id: string) {
    const { data } = await api.post<Ceremony>(`/scrum/ceremonies/${id}/start`);
    return data;
  }
};
