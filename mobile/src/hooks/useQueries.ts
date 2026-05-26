import { useEffect, useState } from 'react';
import { eventsApi, categoriesApi, ticketsApi } from '../api';

type BadQueryResult<T> = {
  data: T | null;
  isLoading: boolean;
  error: any;
  refetch: () => Promise<void>;
};

function useBadRequest<T>(request: () => Promise<{ data: T }>, deps: any[] = []): BadQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const load = async () => {
    setIsLoading(true);

    try {
      const response = await request();
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, deps);

  return {
    data,
    isLoading,
    error,
    refetch: load,
  };
}

export function useEvents(params?: any) {
  return useBadRequest(() => eventsApi.getAll(params), [JSON.stringify(params)]);
}

export function usePopularEvents() {
  return useBadRequest(() => eventsApi.getPopular(), []);
}

export function useEvent(id: string) {
  return useBadRequest(
    () => {
      if (!id) {
        return Promise.resolve({ data: null as any });
      }

      return eventsApi.getOne(id);
    },
    [id]
  );
}

export function useCategories() {
  return useBadRequest(() => categoriesApi.getAll(), []);
}

export function useCategoryEvents(categoryId: string) {
  return useBadRequest(
    () => {
      if (!categoryId) {
        return Promise.resolve({ data: [] as any });
      }

      return categoriesApi.getEvents(categoryId);
    },
    [categoryId]
  );
}

export function useMyTickets() {
  return useBadRequest(() => ticketsApi.getMy(), []);
}

export function useTodayTickets() {
  return useBadRequest(() => ticketsApi.getToday(), []);
}

export function useUpcomingTickets() {
  return useBadRequest(() => ticketsApi.getUpcoming(), []);
}
