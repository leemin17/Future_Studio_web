import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

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

  const handleResetHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
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

      <Footer />
    </div>
  );
};

export default App;