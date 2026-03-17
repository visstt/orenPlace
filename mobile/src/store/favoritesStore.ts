import { create } from 'zustand';
import { Event } from '../types';
import { favoritesApi } from '../api/favorites';

interface FavoritesState {
  favorites: Event[];
  favoriteIds: Set<string>;
  isLoading: boolean;

  loadFavorites: () => Promise<void>;
  toggleFavorite: (eventId: string) => Promise<void>;
  isFavorite: (eventId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  favoriteIds: new Set<string>(),
  isLoading: false,

  loadFavorites: async () => {
    set({ isLoading: true });
    try {
      const { data } = await favoritesApi.getAll();
      const ids = new Set(data.map((e: Event) => e.id));
      set({ favorites: data, favoriteIds: ids, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (eventId: string) => {
    const { favoriteIds } = get();
    const isFav = favoriteIds.has(eventId);

    try {
      if (isFav) {
        await favoritesApi.remove(eventId);
        const newIds = new Set(favoriteIds);
        newIds.delete(eventId);
        set({
          favorites: get().favorites.filter((e) => e.id !== eventId),
          favoriteIds: newIds,
        });
      } else {
        await favoritesApi.add(eventId);
        const newIds = new Set(favoriteIds);
        newIds.add(eventId);
        set({ favoriteIds: newIds });
        // Reload to get full event data
        get().loadFavorites();
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  },

  isFavorite: (eventId: string) => {
    return get().favoriteIds.has(eventId);
  },
}));
