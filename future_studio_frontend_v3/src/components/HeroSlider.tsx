import React, { useState, useEffect } from 'react';
import { heroImages } from '../data/database';
import { useNavigate } from 'react-router-dom';

interface HeroSliderProps {
  onHeroClick: (index: number) => void;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ onHeroClick }) => {
  const navigate = useNavigate();
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  useEffect(() => {
    const heroInterval = setInterval(() => {
      setCurrentHeroSlide((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(heroInterval);
  }, []);

  const handlePrevHero = () => {
    setCurrentHeroSlide((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));
  };

  const handleNextHero = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length);
  };

  return (
    <div className="hero-full-container">
      <div className="hero-slider-wrapper">
        {/* <button className="hero-nav-btn prev" onClick={handlePrevHero}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button> */}

        <div className="hero-frame">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className="hero-slide"
              style={{
                backgroundImage: `url(${img})`,
                opacity: index === currentHeroSlide ? 1 : 0,
                cursor: 'pointer',

                pointerEvents: index === currentHeroSlide ? 'auto' : 'none',
                zIndex: index === currentHeroSlide ? 2 : 1
              }}
              onClick={() => onHeroClick(index)}
            />
          ))}

          {/* <div className="hero-dots">
            {heroImages.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrentHeroSlide(index)}
                className={`hero-dot ${index === currentHeroSlide ? 'active' : ''}`}
              />
            ))}
          </div> */}
        </div>

        {/* <button className="hero-nav-btn next" onClick={handleNextHero}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button> */}
      </div>

      {/* <div className="hero-bottom-action">
        <button 
          className="btn-dozo-about"
          onClick={() => {
            navigate('/about');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          Future Studio là gì?
        </button>

      </div> */}
    </div>
  );
};

export default HeroSlider;
