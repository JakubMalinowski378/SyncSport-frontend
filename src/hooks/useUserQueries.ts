import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { UpdateProfilePayload } from '../services/userService';

export const userKeys = {
  all: ['users'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: Record<string, string | number | undefined>) =>
    [...userKeys.lists(), params] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => userService.getProfile(),
  });
}

export function useUsers(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getUsers(params),
  });
}

export function useUserById(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userService.updateProfile(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.profile() }),
  });
}

export function useChangeUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: number }) =>
      userService.changeUserRole(userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.lists() }),
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      userService.toggleUserStatus(userId, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.lists() }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.lists() }),
  });
}
