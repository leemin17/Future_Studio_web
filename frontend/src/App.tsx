import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Header from './components/Header';
import AppRoutes from './pages';
import Preloader from './components/Preloader';
import RouteMetadata from './components/RouteMetadata';
import { useAppNavigation } from './hooks/useAppNavigation';

interface RoutePreloaderProps {
  enabled: boolean;
}

const RoutePreloader: React.FC<RoutePreloaderProps> = ({ enabled }) => {
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (isLoading) return;

    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.height = '';
  }, [isLoading]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const location = useLocation();
  const { goHome } = useAppNavigation();
  const isQuickViewRoute = location.pathname.startsWith('/projects/');
  const skipPreloader = Boolean((location.state as { skipPreloader?: boolean } | null)?.skipPreloader);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  const isAtDetailPage = location.pathname !== '/';
  const showFixedHeader = true;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <RouteMetadata />
      <RoutePreloader
        key={`${location.pathname}:${skipPreloader}`}
        enabled={!isQuickViewRoute && !skipPreloader}
      />

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
