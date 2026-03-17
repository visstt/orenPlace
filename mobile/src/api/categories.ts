import api from './client';
import { Category, Event } from '../types';

export const categoriesApi = {
  getAll: () =>
    api.get<Category[]>('/categories'),

  getOne: (id: string) =>
    api.get<Category>(`/categories/${id}`),

  getEvents: (id: string) =>
    api.get<Event[]>(`/categories/${id}/events`),
};
