import type { TeamMember } from '@shared/types';
import { supabase } from '../lib/supabase';

const requireSupabase = () => {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
};

const mapMember = (row: Record<string, unknown>): TeamMember => ({
  id: Number(row.id),
  name: String(row.name ?? ''),
  role: String(row.role ?? ''),
  image: String(row.image ?? ''),
  color: String(row.color ?? 'rgba(255, 255, 255, 0.15)'),
  bio: String(row.bio ?? ''),
  socials: (row.socials ?? {}) as Record<string, string>,
  skills: (row.skills ?? []) as TeamMember['skills'],
});

export const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  const client = requireSupabase();
  const { data, error } = await client
    .from('members')
    .select('id, name, role, image, color, bio, socials, skills')
    .order('id', { ascending: true });

  if (error) throw new Error(error.message || 'Unable to load team members.');
  return (data ?? []).map((row) => mapMember(row));
};

export const createTeamMember = async (member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
  const client = requireSupabase();
  const { data, error } = await client
    .from('members')
    .insert({
      name: member.name,
      role: member.role,
      image: member.image,
      color: member.color,
      bio: member.bio,
      socials: member.socials ?? {},
      skills: member.skills ?? [],
    })
    .select('id, name, role, image, color, bio, socials, skills')
    .single();

  if (error) throw new Error(error.message || 'Unable to create team member.');
  return mapMember(data);
};
