import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Header from './components/Header';
import AppRoutes from './pages';
import Preloader from './components/Preloader';
import RouteMetadata from './components/RouteMetadata';
import { useAppNavigation } from './hooks/useAppNavigation';

const App: React.FC = () => {
  const location = useLocation();
  const { goHome } = useAppNavigation();

  // 1. Quản lý trạng thái loading
  const [isLoading, setIsLoading] = useState(true);

  // 2. Mỗi khi location.pathname thay đổi, reset lại trạng thái loading
  useEffect(() => {
    setIsLoading(true); // Kích hoạt Preloader
  }, [location.pathname]); // Lắng nghe sự thay đổi URL

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => {
    if (isLoading) return;

    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.height = '';
  }, [isLoading, location.pathname]);

  const isAtDetailPage = location.pathname !== '/';
  const showFixedHeader = true;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Preloader sẽ xuất hiện mỗi khi isLoading = true */}
      <RouteMetadata />
      <AnimatePresence mode="wait">
        {isLoading && (
          <Preloader 
            key={location.pathname} // Key giúp reset animation mỗi khi chuyển trang
            onComplete={() => setIsLoading(false)} 
          />
        )}
      </AnimatePresence>

      <Header
        onLogoClick={goHome}
        showFixedHeader={showFixedHeader}
        isAtDetailPage={isAtDetailPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className={isAtDetailPage ? 'main-content-padding' : ''}>
        <AppRoutes />
      </main>
    </>
  );
};

export default App;
