import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationService } from '../services/reservationService';
import type { CreateReservationPayload, CreateCheckoutSessionPayload } from '../services/reservationService';

export const reservationKeys = {
  all: ['reservations'] as const,
  lists: () => [...reservationKeys.all, 'list'] as const,
  list: (params?: Record<string, string | number | undefined>) =>
    [...reservationKeys.lists(), params] as const,
  details: () => [...reservationKeys.all, 'detail'] as const,
  detail: (id: string) => [...reservationKeys.details(), id] as const,
};

export function useMyReservations(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: reservationKeys.list(params),
    queryFn: () => reservationService.getMyReservations(params),
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: () => reservationService.getReservation(id),
    enabled: !!id,
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReservationPayload) =>
      reservationService.createReservation(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: reservationKeys.all }),
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (payload: CreateCheckoutSessionPayload) =>
      reservationService.createCheckoutSession(payload),
  });
}
