import type { NextFunction, Request, Response } from 'express';
import type { User } from '@supabase/supabase-js';
import { requireSupabaseAdmin, requireSupabaseAuth } from '../lib/supabase.ts';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

const listFromEnvironment = (name: string) =>
  (process.env[name] ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

export const isAdminUser = async (user: User): Promise<boolean> => {
  if (user.app_metadata?.role === 'admin') return true;
  if (listFromEnvironment('ADMIN_USER_IDS').includes(user.id.toLowerCase())) return true;
  if (user.email && listFromEnvironment('ADMIN_EMAILS').includes(user.email.toLowerCase())) return true;

  const { data, error } = await requireSupabaseAdmin()
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    // A missing admin_users table must not accidentally grant access.
    console.warn('Unable to verify admin_users membership:', error.message);
    return false;
  }
  return Boolean(data);
};

export const requireAuthenticated = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) => {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return response.status(401).json({ message: 'Authentication required' });
  }

  const token = authorization.slice('Bearer '.length).trim();
  const { data, error } = await requireSupabaseAuth().auth.getUser(token);
  if (error || !data.user) {
    return response.status(401).json({ message: 'Invalid or expired session' });
  }

  request.user = data.user;
  return next();
};

export const requireAdmin = [
  requireAuthenticated,
  async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    if (!request.user || !(await isAdminUser(request.user))) {
      return response.status(403).json({ message: 'Admin permission required' });
    }
    return next();
  },
];
