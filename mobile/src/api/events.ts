import api from './client';
import { Event, EventsResponse, EventQueryParams } from '../types';

export const eventsApi = {
  getAll: (params?: EventQueryParams) =>
    api.get<EventsResponse>('/events', { params }),

  getPopular: () =>
    api.get<Event[]>('/events/popular'),

  getOne: (id: string) =>
    api.get<Event>(`/events/${id}`),

  search: (query: string) =>
    api.get<Event[]>('/events/search', { params: { q: query } }),
};
