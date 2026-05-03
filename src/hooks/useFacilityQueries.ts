import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facilityService } from '../services/facilityService';

export const facilityKeys = {
  all: ['facilities'] as const,
  lists: () => [...facilityKeys.all, 'list'] as const,
  list: (params?: Record<string, string | number | undefined>) =>
    [...facilityKeys.lists(), params] as const,
  details: () => [...facilityKeys.all, 'detail'] as const,
  detail: (slug: string) => [...facilityKeys.details(), slug] as const,
  courts: (facilitySlug: string) => [...facilityKeys.all, 'courts', facilitySlug] as const,
  court: (facilitySlug: string, courtSlug: string) =>
    [...facilityKeys.all, 'court', facilitySlug, courtSlug] as const,
  tariffs: (facilityId: string) => [...facilityKeys.all, 'tariffs', facilityId] as const,
  weekReservations: (courtId: string, weekDate: string) =>
    [...facilityKeys.all, 'weekReservations', courtId, weekDate] as const,
};

export function useFacilities(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: facilityKeys.list(params),
    queryFn: () => facilityService.getFacilities(params),
  });
}

export function useFacility(slug: string) {
  return useQuery({
    queryKey: facilityKeys.detail(slug),
    queryFn: () => facilityService.getFacility(slug),
    enabled: !!slug,
  });
}

export function useCourts(facilitySlug: string, params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: facilityKeys.courts(facilitySlug),
    queryFn: () => facilityService.getCourts(facilitySlug, params),
    enabled: !!facilitySlug,
  });
}

export function useCourt(facilitySlug: string, courtSlug: string) {
  return useQuery({
    queryKey: facilityKeys.court(facilitySlug, courtSlug),
    queryFn: () => facilityService.getCourt(facilitySlug, courtSlug),
    enabled: !!facilitySlug && !!courtSlug,
  });
}

export function useTariffs(facilityId: string) {
  return useQuery({
    queryKey: facilityKeys.tariffs(facilityId),
    queryFn: () => facilityService.getTariffs(facilityId),
    enabled: !!facilityId,
  });
}

export function useWeekReservations(courtId: string, weekDate: string) {
  return useQuery({
    queryKey: facilityKeys.weekReservations(courtId, weekDate),
    queryFn: () => facilityService.getWeekReservations(courtId, weekDate),
    enabled: !!courtId && !!weekDate,
  });
}

export function useCreateFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => facilityService.createFacility(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: facilityKeys.lists() }),
  });
}

export function useUpdateFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      facilityService.updateFacility(id, formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: facilityKeys.all }),
  });
}

export function useDeleteFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => facilityService.deleteFacility(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: facilityKeys.lists() }),
  });
}

export function useCreateCourt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ facilityId, formData }: { facilityId: string; formData: FormData }) =>
      facilityService.createCourt(facilityId, formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: facilityKeys.all }),
  });
}

export function useUpdateCourt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ facilityId, courtId, formData }: { facilityId: string; courtId: string; formData: FormData }) =>
      facilityService.updateCourt(facilityId, courtId, formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: facilityKeys.all }),
  });
}

export function useDeleteCourt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ facilitySlug, courtId }: { facilitySlug: string; courtId: string }) =>
      facilityService.deleteCourt(facilitySlug, courtId),
    onSuccess: () => qc.invalidateQueries({ queryKey: facilityKeys.all }),
  });
}

export function useCreateTariff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      facilityId: string;
      baseHourlyRate: number;
      courtOverrides: { courtId: string; hourlyRate: number }[];
    }) => facilityService.createTariff(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: facilityKeys.all }),
  });
}

export function useCalculatePrice() {
  return useMutation({
    mutationFn: (payload: {
      facilityId: string;
      courtId: string;
      startTime: string;
      endTime: string;
    }) => facilityService.calculatePrice(payload),
  });
}
