import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductAdminModal from '../components/ProductAdminModal';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const leaveAdmin = () => navigate('/all-products');
  const returnHome = useCallback(() => navigate('/', { replace: true }), [navigate]);

  return (
    <main className="admin-route-page">
      <ProductAdminModal
        open
        product={null}
        onClose={leaveAdmin}
        onSaved={leaveAdmin}
        onAuthenticated={returnHome}
      />
    </main>
  );
};

export default AdminPage;
