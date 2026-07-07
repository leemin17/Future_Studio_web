import React from 'react';
import { type NewsItem } from '../data/database';
import HeroSlider from '../components/HeroSlider';
import Body from '../components/Body';
import { useAppNavigation } from '../hooks/useAppNavigation';

const HomePage: React.FC = () => {
  const { goToProduct } = useAppNavigation();

  const handleProductClick = (item: NewsItem) => {
    goToProduct(item.id);
  };

  return (
    <>
      <HeroSlider />
      <Body onSelectProduct={handleProductClick} />
    </>
  );
};

export default HomePage;