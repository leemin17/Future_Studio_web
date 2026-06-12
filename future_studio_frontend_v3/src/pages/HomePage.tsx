import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type NewsItem } from '../data/database';
import HeroSlider from '../components/HeroSlider';
import Body from '../components/Body';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleHeroClick = (index: number) => {
    navigate(`/hero/${index}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (item: NewsItem) => {
    navigate(`/product/${item.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <HeroSlider onHeroClick={handleHeroClick} />
      <Body onSelectProduct={handleProductClick} />
    </>
  );
};

export default HomePage;