import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { authApi } from '../api/auth';
import { usersApi } from '../api/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const { data } = await authApi.login(email, password);
    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    set({
      user: data.user as User,
      isAuthenticated: true,
    });
  },

  register: async (name, email, password) => {
    const { data } = await authApi.register(name, email, password);
    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    set({
      user: data.user as User,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {}
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const { data } = await usersApi.getMe();
      set({ user: data, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },

  updateUser: async (userData) => {
    const { data } = await usersApi.update(userData);
    set({ user: data });
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        const { data } = await usersApi.getMe();
        set({ user: data, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
