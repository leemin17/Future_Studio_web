import { createClient } from '@supabase/supabase-js';
import {
  contactLinks,
  heroDetails,
  heroImages,
  navItems,
  popularSearches,
  teamMembers,
} from '../shared/fallbackData.ts';

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running the migration.');
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const contentRows = [
  { key: 'hero_media', value: heroImages },
  { key: 'hero_details', value: heroDetails },
  { key: 'navigation', value: navItems },
  { key: 'contact_links', value: contactLinks },
  { key: 'popular_searches', value: popularSearches },
].map((row) => ({ ...row, updated_at: new Date().toISOString() }));

const migrate = async () => {
  const { error: contentError } = await supabase
    .from('site_content')
    .upsert(contentRows, { onConflict: 'key' });
  if (contentError) throw contentError;

  const { error: membersError } = await supabase
    .from('members')
    .upsert(teamMembers.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      image: member.image,
      color: member.color,
      bio: member.bio,
      socials: member.socials ?? {},
      skills: member.skills ?? [],
      updated_at: new Date().toISOString(),
    })), { onConflict: 'id' });
  if (membersError) throw membersError;

  console.log(`Migrated ${contentRows.length} site-content groups and ${teamMembers.length} members.`);
};

await migrate();
