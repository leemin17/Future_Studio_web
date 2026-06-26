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

  // ====================================================================
  // HIỆU ỨNG TỪ TÍNH (MAGNETIC EFFECT) CHO CÁC NÚT
  // ====================================================================
  useEffect(() => {
    // Chỉ chạy hiệu ứng trên thiết bị có con trỏ chính xác (PC/Laptop)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const magneticTargets: HTMLElement[] = [];
    // Map để lưu vị trí hiện tại của từng phần tử, giúp animation mượt mà
    const targetPositions = new Map<HTMLElement, { x: number, y: number }>();

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    const findTargets = () => {
      magneticTargets.forEach(el => { el.style.transform = 'translate(0, 0)'; });
      magneticTargets.length = 0;
      targetPositions.clear();

      const targets = document.querySelectorAll<HTMLElement>('a, button, .search-bar, .cart-status, .menu-burger, .social-icon, .btn-arrow');
      targets.forEach(target => {
        magneticTargets.push(target);
        targetPositions.set(target, { x: 0, y: 0 });
        target.style.transition = 'transform 0.15s ease-out';
      });
    };

    findTargets();

    const renderMagnetic = () => {
      for (const target of magneticTargets) {
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2));

        let targetX = 0;
        let targetY = 0;

        if (distance < 80) { // Bán kính ảnh hưởng
          targetX = (mouseX - centerX) * 0.4; // Lực hút
          targetY = (mouseY - centerY) * 0.4;
        }

        const currentPos = targetPositions.get(target) || { x: 0, y: 0 };
        const newX = currentPos.x + (targetX - currentPos.x) * 0.1;
        const newY = currentPos.y + (targetY - currentPos.y) * 0.1;

        target.style.transform = `translate(${newX}px, ${newY}px)`;
        targetPositions.set(target, { x: newX, y: newY });
      }
      requestAnimationFrame(renderMagnetic);
    };

    const rafId = requestAnimationFrame(renderMagnetic);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
      magneticTargets.forEach(el => { el.style.transform = 'translate(0, 0)'; el.style.transition = ''; });
    };
  }, [location.pathname]); // Chạy lại hiệu ứng khi chuyển trang

  // ====================================================================
  // HIỆU ỨNG CON TRỎ CHUỘT NGHỆ THUẬT (CUSTOM MAGNETIC CURSOR)
  // ====================================================================
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // --- TỐI ƯU HIỆU NĂNG ---
    // Biến này sẽ lưu trạng thái class hiện tại của con trỏ.
    // Chúng ta chỉ cập nhật DOM (thêm/xóa class) khi trạng thái này thực sự thay đổi.
    let currentClass = '';

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
      const cursorText = cursor?.querySelector('.cursor-text') as HTMLElement;
      if (!cursor || !cursorText) return;
      
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
      } else if (target.closest('.news-card, .product-card')) {
        // ĐỒNG BỘ: Sử dụng hiệu ứng 'dragging' (vòng tròn nhỏ) cho tất cả các card
        // để nhất quán với HeroSlider, tạo cảm giác đây là khu vực có thể tương tác.
        newClass = 'dragging';
      } else if (target.closest('a, button, input, .search-bar, .cart-status, .menu-burger')) {
        // Trỏ vào nút -> Ẩn con trỏ custom đi
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
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
    </>
  );
};

export default App;