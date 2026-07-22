import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { fetchAdminProfile } from '../services/auth';

export const useAdminSession = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    const checkPermission = async (accessToken?: string) => {
      if (!accessToken) {
        if (active) setIsAdmin(false);
        return;
      }
      try {
        const profile = await fetchAdminProfile(accessToken);
        if (active) setIsAdmin(profile.isAdmin);
      } catch {
        if (active) setIsAdmin(false);
      }
    };

    void supabase.auth.getSession().then(({ data }) => checkPermission(data.session?.access_token));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void checkPermission(session?.access_token), 0);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return isAdmin;
};
