import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import PageTransition from '../components/PageTransition';

// --- LAZY LOADING COMPONENTS ---
const HomePage = React.lazy(() => import('./HomePage'));
const AllProductsPage = React.lazy(() => import('./AllProductsPage'));
const TeamPage = React.lazy(() => import('./TeamPage'));
const ContactPage = React.lazy(() => import('./ContactPage'));
const AdminPage = React.lazy(() => import('./AdminPage'));
const ProjectQuickViewRoute = React.lazy(() => import('./ProjectQuickViewRoute'));

// Component hiển thị trong lúc chờ tải trang
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  </div>
);

const AppRoutes: React.FC = () => {
    const location = useLocation();
    const backgroundLocation = (location.state as { backgroundLocation?: Location } | null)?.backgroundLocation;
    const pageLocation = backgroundLocation ?? location;

    return (
        <Suspense fallback={<LoadingFallback />}>
            <AnimatePresence mode="wait">
                <Routes location={pageLocation} key={pageLocation.pathname}>
                    <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
                    <Route path="/all-products" element={<PageTransition><AllProductsPage /></PageTransition>} />
                    <Route path="/cartoon-3d" element={<PageTransition><AllProductsPage category="cartoon-3d" /></PageTransition>} />
                    <Route path="/tvc" element={<PageTransition><AllProductsPage category="tvc" /></PageTransition>} />
                    <Route path="/art" element={<PageTransition><AllProductsPage category="art" /></PageTransition>} />
                    <Route path="/showreel" element={<PageTransition><AllProductsPage category="showreel" /></PageTransition>} />
                    <Route path="/projects/:projectSlug" element={<PageTransition><AllProductsPage /></PageTransition>} />
                    <Route path="/team" element={<PageTransition><TeamPage /></PageTransition>} />
                    <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </AnimatePresence>
            {backgroundLocation && (
                <Routes>
                    <Route path="/projects/:projectSlug" element={<ProjectQuickViewRoute />} />
                </Routes>
            )}
        </Suspense>
    );
}

export default AppRoutes;
