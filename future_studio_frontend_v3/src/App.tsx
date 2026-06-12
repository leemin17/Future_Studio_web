import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ReactLenis } from 'lenis/react';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import HeroDetailPage from './pages/HeroDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CustomerPage from './pages/CustomerPage';
import AboutPage from './pages/AboutPage';
import SearchOverlay from './components/SearchOverlay';
import PageTransition from './components/PageTransition';

/* =====================================================================
   5. COMPONENT GỐC (APP) LẮP RÁP CÁC ROUTE
   ===================================================================== */
const App: React.FC = () => {
  const [showFixedHeader, setShowFixedHeader] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Biến kiểm tra xem có đang ở trang phụ (trang chi tiết) hay không
  const isAtDetailPage = location.pathname !== '/';

  // SỬA LỖI: Header chỉ "dính" lại (sticky) sau khi cuộn 800px trên mọi trang,
  // gây ra lỗi trên trang chi tiết (vốn không có banner lớn).
  // GIẢI PHÁP: Thay đổi ngưỡng cuộn tùy theo trang.
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = isAtDetailPage ? 1 : 800;
      if (window.scrollY > scrollThreshold) {
        setShowFixedHeader(true);
      } else {
        setShowFixedHeader(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAtDetailPage]); // Thêm isAtDetailPage để logic được cập nhật khi chuyển trang

  // --- MỞ KHÓA CUỘN CHO HERO BANNER ---
  // Tự động gán thuộc tính 'data-lenis-prevent' để Lenis bỏ qua khu vực này,
  // giúp anh có thể thoải mái lăn chuột lướt dọc qua các slide ảnh.
  useEffect(() => {
    const heroFrame = document.querySelector('.hero-frame');
    if (heroFrame) {
      heroFrame.setAttribute('data-lenis-prevent', 'true');
    }
  }, [location.pathname]); // Chạy lại việc kiểm tra mỗi khi chuyển trang

  const handleResetHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    // Bọc toàn bộ App bằng ReactLenis để có hiệu ứng trượt êm ái có đà
    <ReactLenis root options={{ lerp: 0.08, duration: 1.5, smoothWheel: true }}>
      <Header
        onLogoClick={handleResetHome}
        showFixedHeader={showFixedHeader}
        isAtDetailPage={isAtDetailPage}
        onSearchClick={() => setIsSearchOpen(true)}
      />

      {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}

      {/* mode="wait" đợi trang cũ biến mất hẳn rồi trang mới mới hiện ra */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/hero/:id" element={<PageTransition><HeroDetailPage /></PageTransition>} />
          <Route path="/product/:id" element={<PageTransition><ProductDetailPage /></PageTransition>} />
          <Route path="/customers" element={<PageTransition><CustomerPage /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        </Routes>
      </AnimatePresence>

      {/* <Footer /> */}
    </ReactLenis>
  );
};

export default App;