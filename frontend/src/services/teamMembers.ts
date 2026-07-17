import type { TeamMember } from '@shared/types';
import { supabase } from '../lib/supabase';

const requireSupabase = () => {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
};

const normalizeText = (value: unknown) => String(value ?? '').normalize('NFC');

const mapMember = (row: Record<string, unknown>): TeamMember => ({
  id: Number(row.id),
  name: normalizeText(row.name),
  role: normalizeText(row.role),
  image: String(row.image ?? ''),
  color: String(row.color ?? 'rgba(255, 255, 255, 0.15)'),
  bio: normalizeText(row.bio),
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

export const updateTeamMember = async (id: number, member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
  const client = requireSupabase();
  const { data, error } = await client
    .from('members')
    .update({
      name: member.name,
      role: member.role,
      image: member.image,
      color: member.color,
      bio: member.bio,
      socials: member.socials ?? {},
      skills: member.skills ?? [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, name, role, image, color, bio, socials, skills')
    .single();

  if (error) throw new Error(error.message || 'Unable to update team member.');
  return mapMember(data);
};

export const deleteTeamMember = async (id: number): Promise<void> => {
  const client = requireSupabase();
  const { error } = await client.from('members').delete().eq('id', id);
  if (error) throw new Error(error.message || 'Unable to delete team member.');
};
