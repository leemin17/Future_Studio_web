import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import QuickViewModal from '../components/QuickViewModal';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';
import { getProjectIdFromSlug } from '../utils/projectRoutes';

const ProjectQuickViewRoute: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const products = useSupabaseProducts();
  const productId = projectSlug ? getProjectIdFromSlug(projectSlug) : null;
  const product = useMemo(
    () => products.find((item) => item.id === productId) ?? null,
    [productId, products],
  );

  const closeQuickView = () => {
    const state = location.state as { quickViewFrom?: string } | null;
    navigate(state?.quickViewFrom || '/all-products', {
      replace: true,
      state: { skipPreloader: true },
    });
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeQuickView();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return <QuickViewModal product={product} onClose={closeQuickView} />;
};

export default ProjectQuickViewRoute;
