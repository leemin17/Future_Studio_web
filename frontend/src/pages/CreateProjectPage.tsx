import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductAdminModal from '../components/ProductAdminModal';

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const leaveEditor = () => navigate('/all-products');

  return (
    <main className="admin-route-page">
      <ProductAdminModal
        open
        product={null}
        onClose={leaveEditor}
        onSaved={leaveEditor}
      />
    </main>
  );
};

export default CreateProjectPage;

