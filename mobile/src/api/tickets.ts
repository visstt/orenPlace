import api from './client';
import { Ticket } from '../types';

export const ticketsApi = {
  buy: (eventId: string) =>
    api.post<Ticket>(`/tickets/buy/${eventId}`),

  getMy: () =>
    api.get<Ticket[]>('/tickets/my'),

  getToday: () =>
    api.get<Ticket[]>('/tickets/today'),

  getUpcoming: () =>
    api.get<Ticket[]>('/tickets/upcoming'),

  getOne: (id: string) =>
    api.get<Ticket>(`/tickets/${id}`),
};
