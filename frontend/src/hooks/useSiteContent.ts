import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSiteContent = <T,>(key: string, fallback: T): T => {
  const [content, setContent] = useState<T>(fallback);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    void supabase
      .from('site_content')
      .select('value')
      .eq('key', key)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active || error || !data?.value) return;
        setContent(data.value as T);
      });

    return () => {
      active = false;
    };
  }, [key]);

  return content;
};
