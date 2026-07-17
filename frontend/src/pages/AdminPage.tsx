import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductAdminModal from '../components/ProductAdminModal';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const leaveAdmin = () => navigate('/all-products');

  return (
    <main className="admin-route-page">
      <ProductAdminModal
        open
        product={null}
        onClose={leaveAdmin}
        onSaved={leaveAdmin}
      />
    </main>
  );
};

export default AdminPage;
