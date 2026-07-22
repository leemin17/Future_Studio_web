import type { TeamMember } from '../../../shared/types.ts';
import { requireSupabaseAdmin } from '../lib/supabase.ts';
import type { MemberInput } from '../validation/schemas.ts';

const mapMember = (row: Record<string, unknown>): TeamMember => ({
  id: Number(row.id),
  name: String(row.name ?? '').normalize('NFC'),
  role: String(row.role ?? '').normalize('NFC'),
  image: String(row.image ?? ''),
  color: String(row.color ?? 'rgba(255, 255, 255, 0.15)'),
  bio: String(row.bio ?? '').normalize('NFC'),
  socials: (row.socials ?? {}) as Record<string, string>,
  skills: (row.skills ?? []) as TeamMember['skills'],
});

export const getMembers = async (): Promise<TeamMember[]> => {
  const { data, error } = await requireSupabaseAdmin()
    .from('members')
    .select('id, name, role, image, color, bio, socials, skills')
    .order('id', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapMember);
};

export const createMember = async (member: MemberInput): Promise<TeamMember> => {
  const { data, error } = await requireSupabaseAdmin()
    .from('members')
    .insert(member)
    .select('id, name, role, image, color, bio, socials, skills')
    .single();
  if (error) throw error;
  return mapMember(data);
};

export const updateMember = async (id: number, member: MemberInput): Promise<TeamMember> => {
  const { data, error } = await requireSupabaseAdmin()
    .from('members')
    .update({ ...member, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, name, role, image, color, bio, socials, skills')
    .single();
  if (error) throw error;
  return mapMember(data);
};

export const deleteMember = async (id: number): Promise<void> => {
  const { error } = await requireSupabaseAdmin().from('members').delete().eq('id', id);
  if (error) throw error;
};
