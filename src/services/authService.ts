import apiClient from './apiClient';

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInResponse {
  jwtToken: string;
  refreshToken: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

export const authService = {
  signIn: (payload: SignInPayload) =>
    apiClient.post<SignInResponse>('/api/accounts/sign-in', payload).then(res => res.data),

  signUp: (payload: SignUpPayload) =>
    apiClient.post('/api/accounts/sign-up', payload).then(res => res.data),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient.post('/api/accounts/forgot-password', payload).then(res => res.data),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post('/api/accounts/reset-password', payload).then(res => res.data),
};
