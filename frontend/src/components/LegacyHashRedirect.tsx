import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LegacyHashRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const legacyHash = window.location.hash;
    if (!legacyHash.startsWith('#/')) return;
    navigate(legacyHash.slice(1), { replace: true });
  }, [navigate]);

  return null;
};

export default LegacyHashRedirect;
