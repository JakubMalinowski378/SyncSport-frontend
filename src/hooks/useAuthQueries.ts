import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { SignInPayload, SignUpPayload, ForgotPasswordPayload, ResetPasswordPayload } from '../services/authService';

export function useSignIn() {
  return useMutation({
    mutationFn: (payload: SignInPayload) => authService.signIn(payload),
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: (payload: SignUpPayload) => authService.signUp(payload),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authService.forgotPassword(payload),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
  });
}
