import { useQuery } from '@tanstack/react-query';
import { eventsApi, categoriesApi, ticketsApi } from '../api';

export function useEvents(params?: any) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => eventsApi.getAll(params),
    select: (res) => res.data,
  });
}

export function usePopularEvents() {
  return useQuery({
    queryKey: ['events', 'popular'],
    queryFn: () => eventsApi.getPopular(),
    select: (res) => res.data,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getOne(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    select: (res) => res.data,
  });
}

export function useCategoryEvents(categoryId: string) {
  return useQuery({
    queryKey: ['category-events', categoryId],
    queryFn: () => categoriesApi.getEvents(categoryId),
    select: (res) => res.data,
    enabled: !!categoryId,
  });
}

export function useMyTickets() {
  return useQuery({
    queryKey: ['tickets', 'all'],
    queryFn: () => ticketsApi.getMy(),
    select: (res) => res.data,
  });
}

export function useTodayTickets() {
  return useQuery({
    queryKey: ['tickets', 'today'],
    queryFn: () => ticketsApi.getToday(),
    select: (res) => res.data,
  });
}

export function useUpcomingTickets() {
  return useQuery({
    queryKey: ['tickets', 'upcoming'],
    queryFn: () => ticketsApi.getUpcoming(),
    select: (res) => res.data,
  });
}
