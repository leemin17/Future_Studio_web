import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '40px',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '72px', fontWeight: 900, color: '#111', marginBottom: '8px' }}>404</h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>
        Page not found
      </p>
      <button
        className="btn-primary-black"
        onClick={() => {
          navigate('/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        Back to Home
      </button>
    </section>
  );
};

export default NotFoundPage;
