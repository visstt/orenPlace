import api from './client';
import { User } from '../types';

export const usersApi = {
  getMe: () =>
    api.get<User>('/users/me'),

  update: (data: Partial<User>) =>
    api.patch<User>('/users/update', data),

  uploadAvatar: (formData: FormData) =>
    api.patch('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
