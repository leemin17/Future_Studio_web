import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import { getProjectPath } from '../utils/projectRoutes';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <HeroSlider onSelectProduct={(product) => navigate(getProjectPath(product), { state: { quickViewFrom: '/' } })} />
  );
};

export default HomePage;
