import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Header from './components/Header';
import PageTransition from './components/PageTransition';

// --- LAZY LOADING COMPONENTS ---
// Thay vì import trực tiếp, chúng ta dùng React.lazy để trình duyệt chỉ tải code khi cần.
const HomePage = React.lazy(() => import('./pages/HomePage'));
const HeroDetailPage = React.lazy(() => import('./pages/HeroDetailPage'));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage'));
const AllProductsPage = React.lazy(() => import('./pages/AllProductsPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const TeamPage = React.lazy(() => import('./pages/TeamPage'));

// Component hiển thị trong lúc chờ tải trang
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  </div>
);

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
  const [showFixedHeader, setShowFixedHeader] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



  const handleResetHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>


      <Header
        onLogoClick={handleResetHome}
        showFixedHeader={showFixedHeader}
        isAtDetailPage={isAtDetailPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Thêm thẻ main để bọc nội dung và xử lý padding cho header cố định */}
      <main className={isAtDetailPage ? 'main-content-padding' : ''}>
        {/* mode="wait" đợi trang cũ biến mất hẳn rồi trang mới mới hiện ra */}
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
              <Route path="/hero/:id" element={<PageTransition><HeroDetailPage /></PageTransition>} />
              <Route path="/product/:id" element={<PageTransition><ProductDetailPage /></PageTransition>} />
              <Route path="/all-products" element={<PageTransition><AllProductsPage /></PageTransition>} />
              <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
              <Route path="/team" element={<PageTransition><TeamPage /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
    </>
  );
};

export default App;