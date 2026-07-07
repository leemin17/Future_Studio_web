import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Header from './components/Header';
import AppRoutes from './pages';
import CustomCursor from './components/CustomCursor';
import ErrorBoundary from './components/ErrorBoundary'; 

/* =====================================================================
   5. COMPONENT GỐC (APP) LẮP RÁP CÁC ROUTE
   ===================================================================== */
const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Biến kiểm tra xem có đang ở trang phụ (trang chi tiết) hay không
  const isAtDetailPage = location.pathname !== '/';

  // SỬA LỖI: Header chỉ "dính" lại (sticky) sau khi cuộn 800px trên mọi trang,
  // gây ra lỗi trên trang chi tiết (vốn không có banner lớn).
  // YÊU CẦU MỚI: Bỏ hiệu ứng tự hiện ra khi cuộn, cho Header luôn cố định ở trên cùng.
  const showFixedHeader = true;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleResetHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ErrorBoundary>
      <CustomCursor />

      <Header
        onLogoClick={handleResetHome}
        showFixedHeader={showFixedHeader}
        isAtDetailPage={isAtDetailPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className={isAtDetailPage ? 'main-content-padding' : ''}>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </main>
    </ErrorBoundary>
  );
};

export default App;