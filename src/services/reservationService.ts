import apiClient from './apiClient';

export interface UserReservationResponse {
  id: string;
  courtId: string;
  courtName?: string | null;
  facilityName?: string | null;
  startTime: string;
  endTime: string;
  price?: number | null;
  status: ReservationStatus;
}

export type ReservationStatus = 0 | 1 | 2 | 3;

export interface UserReservationResponsePagedResult {
  items: UserReservationResponse[] | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateReservationPayload {
  courtId: string;
  startTime: string;
  endTime: string;
  payOnSite?: boolean;
}

export interface CreateCheckoutSessionPayload {
  reservationId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  url: string;
}

export const reservationService = {
  getMyReservations: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<UserReservationResponsePagedResult>('/api/reservations/me', { params }).then(res => res.data),

  getReservation: (id: string) =>
    apiClient.get<{
      id: string;
      startTime: string;
      endTime: string;
      courtName?: string;
      facilityName?: string;
      facilitySlug?: string;
      courtSlug?: string;
    }>(`/api/reservations/${id}`).then(res => res.data),

  createReservation: (payload: CreateReservationPayload) =>
    apiClient.post<string>('/api/reservations/me', payload).then(res => res.data),

  createCheckoutSession: (payload: CreateCheckoutSessionPayload) =>
    apiClient.post<CheckoutSessionResponse>('/api/payments/create-checkout-session', payload).then(res => res.data),

  markPaidOnSite: (id: string) =>
    apiClient.patch(`/api/reservations/me/${id}/mark-awaiting-on-site-payment`).then(res => res.data),
};
