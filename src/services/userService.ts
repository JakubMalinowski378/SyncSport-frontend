import apiClient from './apiClient';

export interface GetCurrentUserResponse {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  isActive: boolean;
  managedFacilityIds: string[] | null;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
}

export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  isActive: boolean;
  managedFacilityIds: string[] | null;
}

export interface GetUserResponsePagedResult {
  items: User[] | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const userService = {
  getProfile: () =>
    apiClient.get<GetCurrentUserResponse>('/api/users/me').then(res => res.data),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.put('/api/users/me', payload).then(res => res.data),

  getUsers: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<GetUserResponsePagedResult>('/api/users', { params }).then(res => res.data),

  getUserById: (userId: string) =>
    apiClient.get<{ managedFacilityIds: string[] }>(`/api/users/${userId}`).then(res => res.data),

  changeUserRole: (userId: string, role: number) =>
    apiClient.patch(`/api/users/${userId}/role`, { role }).then(res => res.data),

  toggleUserStatus: (userId: string, isActive: boolean) =>
    apiClient.patch(`/api/users/${userId}/status`, { isActive }).then(res => res.data),

  deleteUser: (userId: string) =>
    apiClient.delete(`/api/users/${userId}`).then(res => res.data),
};
