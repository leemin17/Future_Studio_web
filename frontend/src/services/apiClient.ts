import { supabase } from '../lib/supabase';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '');
export const apiUrl = configuredApiUrl || '/api';

interface ApiOptions extends RequestInit {
  authenticated?: boolean;
  accessToken?: string;
}

export const apiRequest = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  if (options.authenticated) {
    if (!supabase) throw new Error('Supabase authentication is not configured.');
    const token = options.accessToken ?? (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) throw new Error('Your admin session has expired. Sign in again.');
    headers.set('Authorization', `Bearer ${token}`);
  }

  const requestOptions: ApiOptions = { ...options };
  delete requestOptions.authenticated;
  delete requestOptions.accessToken;
  const response = await fetch(`${apiUrl}${path}`, { ...requestOptions, headers });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const issue = Array.isArray(body?.issues) ? body.issues[0] : null;
    const issuePath = Array.isArray(issue?.path) && issue.path.length ? `${issue.path.join('.')}: ` : '';
    const details = issue?.message ? ` — ${issuePath}${issue.message}` : '';
    throw new Error(`${body?.message || `API request failed with status ${response.status}.`}${details}`);
  }
  return body as T;
};
