import { useEffect, useState } from 'react';
import { apiRequest } from '../services/apiClient';

export const useSiteContent = <T,>(key: string, fallback: T): T => {
  const [content, setContent] = useState<T>(fallback);

  useEffect(() => {
    let active = true;
    void apiRequest<T | null>(`/content/${encodeURIComponent(key)}`)
      .then((value) => {
        if (active && value !== null) setContent(value);
      })
      .catch((error) => console.warn(`Unable to load site content ${key}:`, error));
    return () => { active = false; };
  }, [key]);

  return content;
};
