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
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: () => reservationService.getReservation(id),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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

export function useMarkPaidOnSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationService.markPaidOnSite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: reservationKeys.all }),
  });
}

export function useAdminCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      userId: string;
      courtId: string;
      startTime: string;
      endTime: string;
      payOnSite: boolean;
    }) => reservationService.adminCreateReservation(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: reservationKeys.all }),
  });
}

export function useAdminDeleteReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, facilityId }: { id: string; facilityId: string }) =>
      reservationService.adminDeleteReservation(id, facilityId),
    onSuccess: () => qc.invalidateQueries({ queryKey: reservationKeys.all }),
  });
}

export function useAdminMarkPaidOnSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationService.adminMarkPaidOnSite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: reservationKeys.all }),
  });
}

export function useUserReservations(userId: string, params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: [...reservationKeys.all, 'user', userId, params],
    queryFn: () => reservationService.getReservationsByUserId(userId, params),
    enabled: !!userId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
