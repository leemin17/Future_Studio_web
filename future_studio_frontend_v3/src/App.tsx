<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
=======
import React, { useState, useEffect, useRef, Suspense } from 'react';
>>>>>>> dev
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Header from './components/Header';
<<<<<<< HEAD
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import HeroDetailPage from './pages/HeroDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CustomerPage from './pages/CustomerPage';
import AboutPage from './pages/AboutPage';
import PageTransition from './components/PageTransition';

=======
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

>>>>>>> dev
/* =====================================================================
   5. COMPONENT GỐC (APP) LẮP RÁP CÁC ROUTE
   ===================================================================== */
const App: React.FC = () => {
  const [showFixedHeader, setShowFixedHeader] = useState(false);
<<<<<<< HEAD
=======
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
>>>>>>> dev
  const cursorRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Biến kiểm tra xem có đang ở trang phụ (trang chi tiết) hay không
  const isAtDetailPage = location.pathname !== '/';

<<<<<<< HEAD
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
=======
  // ====================================================================
  // FIX: ĐỒNG BỘ HIỆU ỨNG CURSOR KHI CHUYỂN TRANG
  // ====================================================================
  // Reset trạng thái của con trỏ chuột mỗi khi chuyển trang (thay đổi URL).
  // Điều này đảm bảo hiệu ứng (vd: "WATCH" trên video) không bị "kẹt" lại
  // khi người dùng điều hướng sang trang khác không có video.
  useEffect(() => {
    const cursor = cursorRef.current;
    if (cursor) {
      cursor.classList.remove('hovering', 'dragging', 'hidden', 'video-hover', 'title-hover');
      const cursorText = cursor.querySelector('.cursor-text') as HTMLElement;
      if (cursorText) cursorText.innerText = '';
    }
  }, [location.pathname]); // Phụ thuộc vào pathname để chạy lại khi URL thay đổi

  // SỬA LỖI: Header chỉ "dính" lại (sticky) sau khi cuộn 800px trên mọi trang,
  // gây ra lỗi trên trang chi tiết (vốn không có banner lớn).
  // YÊU CẦU MỚI: Bỏ hiệu ứng tự hiện ra khi cuộn, cho Header luôn cố định ở trên cùng.
  useEffect(() => {
    setShowFixedHeader(true);
  }, []);
>>>>>>> dev

  // ====================================================================
  // HIỆU ỨNG CON TRỎ CHUỘT NGHỆ THUẬT (CUSTOM MAGNETIC CURSOR)
  // ====================================================================
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

<<<<<<< HEAD
=======
    // Chỉ chạy hiệu ứng trên thiết bị có con trỏ chính xác (PC/Laptop)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // --- TỐI ƯU HIỆU NĂNG ---
    // Biến này sẽ lưu trạng thái class hiện tại của con trỏ.
    // Chúng ta chỉ cập nhật DOM (thêm/xóa class) khi trạng thái này thực sự thay đổi.
    let currentClass = '';

>>>>>>> dev
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let currentScale = 1;
    let isClicking = false;
<<<<<<< HEAD

    // Cập nhật tọa độ khi chuột di chuyển
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
=======
    let rafId: number | null = null;
>>>>>>> dev

    // Bắt sự kiện nhấn và nhả chuột
    const onMouseDown = () => { isClicking = true; };
    const onMouseUp = () => { isClicking = false; };

    // Vòng lặp render (60fps) giúp con trỏ trượt mượt mà có gia tốc (Lerp)
    const renderCursor = () => {
      cursorX += (mouseX - cursorX) * 0.2; // 0.2 là độ trễ, số càng nhỏ càng trễ mượt
      cursorY += (mouseY - cursorY) * 0.2;
<<<<<<< HEAD
      
=======

>>>>>>> dev
      // Nội suy hiệu ứng thu nhỏ mượt mà khi click
      const targetScale = isClicking ? 0.5 : 1; // Thu nhỏ còn 50% khi bấm chuột
      currentScale += (targetScale - currentScale) * 0.2;

      cursor.style.transform = `translate3d(${cursorX - cursor.offsetWidth / 2}px, ${cursorY - cursor.offsetHeight / 2}px, 0) scale(${currentScale})`;
<<<<<<< HEAD
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
=======
      rafId = requestAnimationFrame(renderCursor);
    };

    // Hợp nhất onMouseMove và onMouseOver để tối ưu
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Bắt đầu vòng lặp render nếu chưa chạy
      if (!rafId) rafId = requestAnimationFrame(renderCursor);

      const target = e.target as HTMLElement;
      const cursorText = cursor.querySelector('.cursor-text') as HTMLElement;

      let newClass = '';
      let newText = '';

      // Kiểm tra video hover, hoạt động ngay cả khi có lớp phủ trên video
      const potentialVideoContainer = target.closest('.news-image, .quick-view-media');
      if ((potentialVideoContainer && potentialVideoContainer.querySelector('video')) || target.closest('video')) {
        newClass = 'video-hover';
        newText = 'WATCH';
      } else if (target.closest('.hero-frame')) {
        newClass = 'dragging';
      } else if (target.closest('.section-title')) { // <-- THÊM ĐIỀU KIỆN MỚI
        newClass = 'title-hover';
      } else if (target.closest('.news-card, .product-card, .polaroid-card')) {
        // ĐỒNG BỘ: Sử dụng hiệu ứng 'dragging' (vòng tròn nhỏ) cho tất cả các card
        // để nhất quán với HeroSlider, tạo cảm giác đây là khu vực có thể tương tác.
        newClass = 'dragging';
      } else if (target.closest('a, button, input, iframe, .search-bar, .cart-status, .menu-burger')) {
        // Trỏ vào nút, iframe -> Ẩn con trỏ custom đi
        newClass = 'hidden';
      }

      // Chỉ cập nhật DOM nếu class thay đổi, tránh các thao tác thừa thãi
      if (newClass !== currentClass) {
        // Xóa class cũ nếu có
        if (currentClass) cursor.classList.remove(currentClass);
        // Thêm class mới nếu có
        if (newClass) cursor.classList.add(newClass);
        // Cập nhật text
        cursorText.innerText = newText;
        // Lưu lại trạng thái mới
        currentClass = newClass;
>>>>>>> dev
      }
    };

    window.addEventListener('mousemove', onMouseMove);
<<<<<<< HEAD
    document.addEventListener('mouseover', onMouseOver);
=======
>>>>>>> dev
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
<<<<<<< HEAD
      document.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(rafId);
=======
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      // Hủy vòng lặp render khi component bị unmount
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
>>>>>>> dev
    };
  }, []);

  const handleResetHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Khung chứa con trỏ chuột custom */}
<<<<<<< HEAD
      <div ref={cursorRef} className="custom-cursor"></div>
=======
      <div ref={cursorRef} className="custom-cursor">
        <span className="cursor-text"></span>
      </div>
>>>>>>> dev

      <Header
        onLogoClick={handleResetHome}
        showFixedHeader={showFixedHeader}
        isAtDetailPage={isAtDetailPage}
<<<<<<< HEAD
      />

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
=======
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
>>>>>>> dev
    </>
  );
};

export default App;