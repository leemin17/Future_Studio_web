import React, { useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import QuickViewModal from '../components/QuickViewModal';
import type { NewsItem } from '@data/database';

const HomePage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<NewsItem | null>(null);

  return (
    <>
      <HeroSlider onSelectProduct={setSelectedProduct} />
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
};

export default HomePage;
