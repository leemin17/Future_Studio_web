import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import PageTransition from '../components/PageTransition';
import { artData, cartoon3DData, ctvData, musicData} from '@data/database';

// --- LAZY LOADING COMPONENTS ---
const HomePage = React.lazy(() => import('./HomePage'));
const ProductDetailPage = React.lazy(() => import('./ProductDetailPage'));
const AllProductsPage = React.lazy(() => import('./AllProductsPage'));
const TeamPage = React.lazy(() => import('./TeamPage'));
const ContactPage = React.lazy(() => import('./ContactPage'));

// Component hiển thị trong lúc chờ tải trang
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  </div>
);

const AppRoutes: React.FC = () => {
    const location = useLocation();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
                    <Route path="/product/:id" element={<PageTransition><ProductDetailPage /></PageTransition>} />
                    <Route path="/all-products" element={<PageTransition><AllProductsPage /></PageTransition>} />
                    <Route path="/cartoon-3d" element={<PageTransition><AllProductsPage products={cartoon3DData} /></PageTransition>} />
                    <Route path="/ctv" element={<PageTransition><AllProductsPage products={ctvData} /></PageTransition>} />
                    <Route path="/art" element={<PageTransition><AllProductsPage products={artData} /></PageTransition>} />
                    <Route path="/music" element={<PageTransition><AllProductsPage products={musicData} /></PageTransition>} />
                    <Route path="/team" element={<PageTransition><TeamPage /></PageTransition>} />
                    <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
                </Routes>
            </AnimatePresence>
        </Suspense>
    );
}

export default AppRoutes;
