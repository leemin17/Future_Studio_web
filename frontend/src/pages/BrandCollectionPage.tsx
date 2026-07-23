import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useBrands } from '../hooks/useBrands';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';
import { getProjectPath } from '../utils/projectRoutes';
import { resolveMediaUrl } from '../utils/media';
import { applySeoMetadata, getAbsoluteMediaUrl } from '../utils/seo';

const BrandCollectionPage: React.FC = () => {
  const { brandSlug = '' } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: brands = [], isLoading } = useBrands();
  const products = useSupabaseProducts();
  const brand = brands.find((item) => item.slug === brandSlug);
  const brandProducts = useMemo(
    () => brand ? products.filter((product) => product.brandId === brand.id) : [],
    [brand, products],
  );

  useEffect(() => {
    if (!brand) return;
    applySeoMetadata({
      title: `${brand.name} × Future Studio | Creative collaborations`,
      description: brand.description || `Explore creative projects made by Future Studio in collaboration with ${brand.name}.`,
      path: `/brands/${brand.slug}`,
      image: getAbsoluteMediaUrl(brand.logoUrl),
      robots: 'index, follow, max-image-preview:large',
    });
  }, [brand]);

  if (isLoading) return <div className="brand-collection-loading" />;
  if (!brand) {
    return (
      <section className="brand-collection-empty">
        <span>404</span>
        <h1>Collaboration not found</h1>
        <button type="button" onClick={() => navigate('/')}>Return home</button>
      </section>
    );
  }

  return (
    <div className="brand-collection-page">
      <header className="brand-collection-hero">
        <div className="brand-collection-kicker">
          <span>Collaboration with</span>
          <img src={brand.logoUrl} alt={brand.name} />
        </div>
        <h1>{brand.name}<i>×</i>Future Studio</h1>
        <div className="brand-collection-intro">
          <p>{brand.description || `A selection of work created together with ${brand.name}.`}</p>
          <span>{String(brandProducts.length).padStart(2, '0')} projects</span>
        </div>
      </header>

      <section className="brand-projects" aria-label={`${brand.name} projects`}>
        {brandProducts.length ? (
          <motion.div className="brand-projects-grid" layout>
            {brandProducts.map((product, index) => (
              <motion.button
                type="button"
                className="brand-project-card"
                key={product.id}
                layout
                onClick={() => navigate(getProjectPath(product), {
                  state: { quickViewFrom: location.pathname, backgroundLocation: location },
                })}
              >
                <span className="brand-project-media">
                  <img src={resolveMediaUrl(product.imageUrl)} alt={`${product.title} — ${brand.name}`} loading="lazy" />
                  <span className="brand-project-view">View project ↗</span>
                </span>
                <span className="brand-project-meta">
                  <small>{String(index + 1).padStart(2, '0')} / {product.category?.replace('-', ' ') || 'project'}</small>
                  <strong>{product.title}</strong>
                  <em>{product.date}</em>
                </span>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <div className="brand-projects-empty">
            <p>No published projects have been linked to this brand yet.</p>
            <button type="button" onClick={() => navigate('/all-products')}>Explore all projects</button>
          </div>
        )}
      </section>
    </div>
  );
};

export default BrandCollectionPage;
