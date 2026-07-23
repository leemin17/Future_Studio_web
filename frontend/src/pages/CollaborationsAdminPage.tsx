import React from 'react';
import { useNavigate } from 'react-router-dom';
import BrandAdminModal from '../components/BrandAdminModal';
import { useBrands } from '../hooks/useBrands';

const CollaborationsAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: brands = [] } = useBrands();

  return (
    <main className="admin-route-page">
      <BrandAdminModal
        open
        brands={brands}
        onClose={() => navigate('/team')}
      />
    </main>
  );
};

export default CollaborationsAdminPage;

