import { apiRequest } from './apiClient';

export interface AdminProfile {
  id: string;
  email?: string;
  isAdmin: boolean;
}

export const fetchAdminProfile = (accessToken?: string) =>
  apiRequest<AdminProfile>('/auth/me', { authenticated: true, accessToken });
