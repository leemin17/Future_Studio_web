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
const CustomerPage = React.lazy(() => import('./pages/CustomerPage'));
const AllProductsPage = React.lazy(() => import('./pages/AllProductsPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const MVPage = React.lazy(() => import('./pages/MVPage'));

// Component hiển thị trong lúc chờ tải trang
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  </div>
);

/* =====================================================================
   5. COMPONENT GỐC (APP) LẮP RÁP CÁC ROUTE
   ===================================================================== */
const App: React.FC = () => {
  const [showFixedHeader, setShowFixedHeader] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

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

  // ====================================================================
  // HIỆU ỨNG CON TRỎ CHUỘT NGHỆ THUẬT (CUSTOM MAGNETIC CURSOR)
  // ====================================================================
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let currentScale = 1;
    let isClicking = false;

    // Cập nhật tọa độ khi chuột di chuyển
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Bắt sự kiện nhấn và nhả chuột
    const onMouseDown = () => { isClicking = true; };
    const onMouseUp = () => { isClicking = false; };

    // Vòng lặp render (60fps) giúp con trỏ trượt mượt mà có gia tốc (Lerp)
    const renderCursor = () => {
      cursorX += (mouseX - cursorX) * 0.2; // 0.2 là độ trễ, số càng nhỏ càng trễ mượt
      cursorY += (mouseY - cursorY) * 0.2;
      
      // Nội suy hiệu ứng thu nhỏ mượt mà khi click
      const targetScale = isClicking ? 0.5 : 1; // Thu nhỏ còn 50% khi bấm chuột
      currentScale += (targetScale - currentScale) * 0.2;

      cursor.style.transform = `translate3d(${cursorX - cursor.offsetWidth / 2}px, ${cursorY - cursor.offsetHeight / 2}px, 0) scale(${currentScale})`;
      requestAnimationFrame(renderCursor);
    };
    const rafId = requestAnimationFrame(renderCursor);

    // Kiểm tra xem chuột có đang nằm trên thẻ tương tác không để phóng to
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.hero-frame')) {
        cursor.classList.add('dragging');
        cursor.classList.remove('hovering', 'hidden');
      } else if (target.closest('.news-card, .product-card')) {
        cursor.classList.add('hovering');
        cursor.classList.remove('dragging', 'hidden');
      } else if (target.closest('a, button, input, .search-bar, .cart-status, .menu-burger')) {
        // Trỏ vào nút -> Ẩn con trỏ custom đi
        cursor.classList.add('hidden');
        cursor.classList.remove('hovering', 'dragging');
      } else {
        cursor.classList.remove('hovering', 'dragging', 'hidden');
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleResetHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Khung chứa con trỏ chuột custom */}
      <div ref={cursorRef} className="custom-cursor"></div>

      <Header
        onLogoClick={handleResetHome}
        showFixedHeader={showFixedHeader}
        isAtDetailPage={isAtDetailPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* mode="wait" đợi trang cũ biến mất hẳn rồi trang mới mới hiện ra */}
      <Suspense fallback={<LoadingFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
            <Route path="/hero/:id" element={<PageTransition><HeroDetailPage /></PageTransition>} />
            <Route path="/product/:id" element={<PageTransition><ProductDetailPage /></PageTransition>} />
            <Route path="/customers" element={<PageTransition><CustomerPage /></PageTransition>} />
            <Route path="/all-products" element={<PageTransition><AllProductsPage /></PageTransition>} />
            <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
            <Route path="/music-videos" element={<PageTransition><MVPage /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
};

export default App;