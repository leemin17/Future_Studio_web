import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  fs.readFileSync(new URL('../frontend/.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith('#'))
    .map((line) => {
      const separator = line.indexOf('=');
      const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
      return [line.slice(0, separator).trim(), value];
    }),
);

if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Supabase environment variables are missing.');
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error, count } = await supabase
  .from('members')
  .select('id, name', { count: 'exact' })
  .order('id', { ascending: true });

if (error) {
  console.error('SUPABASE_ERROR', error.code, error.message);
  process.exit(1);
}

console.log(JSON.stringify({ connected: true, count, names: data.map((member) => member.name) }));
