import apiClient from './apiClient';

export interface Facility {
  id: string;
  slug?: string | null;
  name: string | null;
  address: string | null;
  reservationDuration?: number | null;
  openingHours?: OpeningHour[] | null;
  images?: unknown[] | null;
}

export interface OpeningHour {
  dayName: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface GetFacilitiesResponsePagedResult {
  items: Facility[] | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface Court {
  id: string;
  name: string | null;
  slug?: string | null;
  surfaceType: string | null;
  isActive: boolean;
  images?: unknown[] | null;
  overrideReservationDuration?: number | null;
}

export interface CourtDtoPagedResult {
  items: Court[] | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface TariffDto {
  id: string;
  facilityId: string;
  baseHourlyRate: number;
  courtOverrides: CourtRateOverride[] | null;
}

export interface CourtRateOverride {
  courtId: string;
  hourlyRate: number;
}

export interface Slot {
  startTime: string;
  endTime: string;
  status: null | 'Pending' | 'Paid';
}

export interface DaySlots {
  date: string;
  dayOfWeek: number;
  slots: Slot[];
}

export interface WeekReservations {
  weekStartDate: string;
  weekEndDate: string;
  days: DaySlots[];
}

export const facilityService = {
  getFacilities: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<GetFacilitiesResponsePagedResult>('/api/facilities', { params }).then(res => res.data),

  getFacility: (slug: string) =>
    apiClient.get<Facility>(`/api/facilities/${slug}`).then(res => res.data),

  createFacility: (formData: FormData) =>
    apiClient.post<string>('/api/facilities', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data),

  updateFacility: (id: string, formData: FormData) =>
    apiClient.put(`/api/facilities/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data),

  deleteFacility: (id: string) =>
    apiClient.delete(`/api/facilities/${id}`).then(res => res.data),

  getCourts: (facilitySlug: string, params?: Record<string, string | number | undefined>) =>
    apiClient.get<CourtDtoPagedResult>(`/api/facilities/${facilitySlug}/courts`, { params }).then(res => res.data),

  getCourt: (facilitySlug: string, courtSlug: string) =>
    apiClient.get<Court>(`/api/facilities/${facilitySlug}/courts/${courtSlug}`).then(res => res.data),

  createCourt: (facilityId: string, formData: FormData) =>
    apiClient.post(`/api/facilities/${facilityId}/courts`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data),

  updateCourt: (facilityId: string, courtId: string, formData: FormData) =>
    apiClient.put(`/api/facilities/${facilityId}/courts/${courtId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data),

  deleteCourt: (facilitySlug: string, courtId: string) =>
    apiClient.delete(`/api/facilities/${facilitySlug}/courts/${courtId}`).then(res => res.data),

  getTariffs: (facilityId: string) =>
    apiClient.get<TariffDto[]>(`/api/tariffs/facility/${facilityId}`).then(res => res.data),

  createTariff: (payload: {
    facilityId: string;
    baseHourlyRate: number;
    courtOverrides: { courtId: string; hourlyRate: number }[];
  }) => apiClient.post('/api/tariffs', payload).then(res => res.data),

  calculatePrice: (payload: {
    facilityId: string;
    courtId: string;
    startTime: string;
    endTime: string;
  }) => apiClient.post<number>('/api/tariffs/calculate', payload).then(res => res.data),

  getWeekReservations: (courtId: string, weekDate: string) =>
    apiClient.get<WeekReservations>(`/api/reservations/courts/${courtId}`, {
      params: { weekDate },
    }).then(res => res.data),
};
