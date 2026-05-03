import apiClient from './apiClient';

export interface CreateCheckoutSessionPayload {
  reservationId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  url: string;
}

export const paymentService = {
  createCheckoutSession: (payload: CreateCheckoutSessionPayload) =>
    apiClient.post<CheckoutSessionResponse>('/api/payments/create-checkout-session', payload).then(res => res.data),
};
