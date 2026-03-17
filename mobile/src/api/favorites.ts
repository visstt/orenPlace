import api from './client';
import { Event } from '../types';

export const favoritesApi = {
  getAll: () =>
    api.get<Event[]>('/favorites'),

  add: (eventId: string) =>
    api.post(`/favorites/${eventId}`),

  remove: (eventId: string) =>
    api.delete(`/favorites/${eventId}`),

  check: (eventId: string) =>
    api.get<{ isFavorite: boolean }>(`/favorites/check/${eventId}`),
};
