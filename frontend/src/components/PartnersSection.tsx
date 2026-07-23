import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandAdminModal from './BrandAdminModal';
import { useAdminSession } from '../hooks/useAdminSession';
import { useBrands } from '../hooks/useBrands';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';

const PartnersSection: React.FC = () => {
  const navigate = useNavigate();
  const isAdmin = useAdminSession();
  const { data: brands = [], isLoading, isError } = useBrands();
  const products = useSupabaseProducts();
  const [managerOpen, setManagerOpen] = useState(false);

  const projectCountByBrand = useMemo(() => products.reduce<Record<number, number>>((counts, product) => {
    if (product.brandId) counts[product.brandId] = (counts[product.brandId] ?? 0) + 1;
    return counts;
  }, {}), [products]);

  const collaborativeProjectCount = useMemo(
    () => Object.values(projectCountByBrand).reduce((total, count) => total + count, 0),
    [projectCountByBrand],
  );

  const scrollToTeam = () => {
    document.querySelector('.team-carousel-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <section className="partners-section" aria-labelledby="partners-title">
      <div className="partners-heading">
        <div>
          <span>Selected collaborations</span>
          <h2 id="partners-title">Brands we’ve<br />created with</h2>
        </div>
        <div className="partners-context">
          <dl className="partners-stats" aria-label="Collaboration statistics">
            <div>
              <dt>{String(brands.length).padStart(2, '0')}</dt>
              <dd>Selected partners</dd>
            </div>
            <div>
              <dt>{String(collaborativeProjectCount).padStart(2, '0')}</dt>
              <dd>Collaborative projects</dd>
            </div>
          </dl>
        </div>
      </div>

      {isLoading ? (
        <div className="partners-loading" aria-label="Loading brand collaborations" />
      ) : brands.length ? (
        <div className="partners-grid">
          {brands.map((brand) => {
            const projectCount = projectCountByBrand[brand.id] ?? 0;
            return (
              <button
                type="button"
                className="partner-logo-item"
                key={brand.id}
                onClick={() => navigate(`/brands/${brand.slug}`)}
                aria-label={`View projects created with ${brand.name}`}
              >
                <span className="partner-project-count">
                  {String(projectCount).padStart(2, '0')} {projectCount === 1 ? 'project' : 'projects'}
                </span>
                <span className="partner-logo-frame">
                  <img src={brand.logoUrl} alt={brand.name} loading="lazy" />
                </span>
                <span className="partner-name">{brand.name}</span>
                <span className="partner-explore" aria-hidden="true">Explore collaboration</span>
                <span className="partner-arrow" aria-hidden="true">↗</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="partners-empty" role="status">
          <span>{isError ? 'Unable to load collaborations' : 'Collaborations are being updated'}</span>
          <p>
            {isAdmin
              ? 'Use Manage collaborations to add the first brand.'
              : 'Our selected brand collaborations will appear here soon.'}
          </p>
        </div>
      )}

      {isAdmin && (
        <button type="button" className="partners-manage" onClick={() => setManagerOpen(true)}>
          Manage collaborations
        </button>
      )}

      {brands.length > 0 && (
        <button type="button" className="partners-team-bridge" onClick={scrollToTeam}>
          <span>Great work starts with great people</span>
          <strong>Meet the people behind the work</strong>
          <i aria-hidden="true">↓</i>
        </button>
      )}

      <BrandAdminModal open={managerOpen} brands={brands} onClose={() => setManagerOpen(false)} />
    </section>
  );
};

export default PartnersSection;
