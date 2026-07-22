import type { TeamMember } from '@shared/types';
import { apiRequest } from './apiClient';

type MemberInput = Omit<TeamMember, 'id'>;

export const fetchTeamMembers = () => apiRequest<TeamMember[]>('/members');

export const createTeamMember = (member: MemberInput) =>
  apiRequest<TeamMember>('/members', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(member),
  });

export const updateTeamMember = (id: number, member: MemberInput) =>
  apiRequest<TeamMember>(`/members/${id}`, {
    method: 'PUT',
    authenticated: true,
    body: JSON.stringify(member),
  });

export const deleteTeamMember = (id: number) =>
  apiRequest<void>(`/members/${id}`, {
    method: 'DELETE',
    authenticated: true,
  });
