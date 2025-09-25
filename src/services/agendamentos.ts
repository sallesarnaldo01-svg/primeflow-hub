import { api, PaginatedResponse } from './api';

export interface Event {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  contactId?: string;
  dealId?: string;
  ticketId?: string;
  location?: string;
  meetingUrl?: string;
  attendees?: string[];
  reminders?: Reminder[];
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // Relacionamentos
  contact?: Contact;
  deal?: Deal;
  ticket?: Ticket;
  creator?: User;
}

export interface Reminder {
  type: 'email' | 'whatsapp' | 'sms';
  minutes: number;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
}

export interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface EventsFilters {
  start?: string;
  end?: string;
  userId?: string;
  contactId?: string;
  status?: string;
  search?: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  contactId?: string;
  dealId?: string;
  ticketId?: string;
  location?: string;
  meetingUrl?: string;
  attendees?: string[];
  reminders?: Reminder[];
}

export interface UpdateEventData extends Partial<CreateEventData> {
  status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
}

export const agendamentosService = {
  async getEvents(filters?: EventsFilters): Promise<Event[]> {
    const response = await api.get<Event[]>('/events', filters);
    return response.data;
  },

  async getEvent(id: string): Promise<Event> {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  async createEvent(data: CreateEventData): Promise<Event> {
    const response = await api.post<Event>('/events', data);
    return response.data;
  },

  async updateEvent(id: string, data: UpdateEventData): Promise<Event> {
    const response = await api.put<Event>(`/events/${id}`, data);
    return response.data;
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  },

  async moveEvent(id: string, start: string, end: string): Promise<Event> {
    const response = await api.put<Event>(`/events/${id}/move`, { start, end });
    return response.data;
  },

  async sendWhatsAppConfirmation(eventId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/events/${eventId}/whatsapp-confirmation`);
    return response.data;
  },

  async sendWhatsAppReminder(eventId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/events/${eventId}/whatsapp-reminder`);
    return response.data;
  },

  async getAvailableSlots(
    userId: string,
    date: string,
    duration: number
  ): Promise<{ start: string; end: string }[]> {
    const response = await api.get<{ start: string; end: string }[]>(
      `/events/available-slots`,
      { userId, date, duration }
    );
    return response.data;
  },
};