import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Header from './components/Header';
import PageTransition from './components/PageTransition';

// --- LAZY LOADING COMPONENTS ---
const HomePage = React.lazy(() => import('./pages/HomePage'));
const HeroDetailPage = React.lazy(() => import('./pages/HeroDetailPage'));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage'));
const AllProductsPage = React.lazy(() => import('./pages/AllProductsPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const TeamPage = React.lazy(() => import('./pages/TeamPage'));

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

  // ====================================================================
  // FIX: ĐỒNG BỘ HIỆU ỨNG CURSOR KHI CHUYỂN TRANG
  // ====================================================================
  useEffect(() => {
    const cursor = cursorRef.current;
    if (cursor) {
      cursor.classList.remove('hovering', 'dragging', 'hidden', 'video-hover', 'title-hover');
      const cursorText = cursor.querySelector('.cursor-text') as HTMLElement;
      if (cursorText) cursorText.innerText = '';
    }
  }, [location.pathname]);

  useEffect(() => {
    setShowFixedHeader(true);
  }, []);

  // ====================================================================
  // HIỆU ỨNG CON TRỎ CHUỘT NGHỆ THUẬT (CUSTOM MAGNETIC CURSOR)
  // ====================================================================
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    if (!window.matchMedia("(pointer: fine)").matches) return;

    let currentClass = '';

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let currentScale = 1;
    let isClicking = false;
    let rafId: number | null = null;

    const onMouseDown = () => { isClicking = true; };
    const onMouseUp = () => { isClicking = false; };

    const renderCursor = () => {
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;

      const targetScale = isClicking ? 0.5 : 1;
      currentScale += (targetScale - currentScale) * 0.2;

      cursor.style.transform = `translate3d(${cursorX - cursor.offsetWidth / 2}px, ${cursorY - cursor.offsetHeight / 2}px, 0) scale(${currentScale})`;
      rafId = requestAnimationFrame(renderCursor);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!rafId) rafId = requestAnimationFrame(renderCursor);

      const target = e.target as HTMLElement;
      const cursorText = cursor.querySelector('.cursor-text') as HTMLElement;

      let newClass = '';
      let newText = '';

      const potentialVideoContainer = target.closest('.news-image, .quick-view-media');
      if ((potentialVideoContainer && potentialVideoContainer.querySelector('video')) || target.closest('video')) {
        newClass = 'video-hover';
        newText = 'WATCH';
      } else if (target.closest('.hero-frame')) {
        newClass = 'dragging';
      } else if (target.closest('.section-title')) {
        newClass = 'title-hover';
      } else if (target.closest('.news-card, .product-card, .polaroid-card')) {
        newClass = 'dragging';
      } else if (target.closest('a, button, input, iframe, .search-bar, .cart-status, .menu-burger')) {
        newClass = 'hidden';
      }

      if (newClass !== currentClass) {
        if (currentClass) cursor.classList.remove(currentClass);
        if (newClass) cursor.classList.add(newClass);
        cursorText.innerText = newText;
        currentClass = newClass;
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const handleResetHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div ref={cursorRef} className="custom-cursor">
        <span className="cursor-text"></span>
      </div>

      <Header
        onLogoClick={handleResetHome}
        showFixedHeader={showFixedHeader}
        isAtDetailPage={isAtDetailPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className={isAtDetailPage ? 'main-content-padding' : ''}>
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
