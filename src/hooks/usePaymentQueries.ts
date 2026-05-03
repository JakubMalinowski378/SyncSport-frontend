import { useMutation } from '@tanstack/react-query';
import { paymentService } from '../services/paymentService';
import type { CreateCheckoutSessionPayload } from '../services/paymentService';

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (payload: CreateCheckoutSessionPayload) =>
      paymentService.createCheckoutSession(payload),
  });
}
