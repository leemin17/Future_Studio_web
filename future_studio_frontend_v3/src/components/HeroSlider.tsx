import React, { useState, useEffect, useRef } from 'react';
import { heroImages } from '../data/database';
import { useNavigate } from 'react-router-dom';

interface HeroSliderProps {
  onHeroClick: (index: number) => void;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ onHeroClick }) => {
  const navigate = useNavigate();
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);
  const isMoved = useRef(false);

  useEffect(() => {
    const heroInterval = setInterval(() => {
      setCurrentHeroSlide((prevIndex) => {
        const nextIndex = (prevIndex + 1) % heroImages.length;
        if (sliderRef.current) {
          const slideHeight = sliderRef.current.clientHeight;
          sliderRef.current.scrollTo({
            top: nextIndex * slideHeight,
            behavior: 'smooth'
          });
        }
        return nextIndex;
      });
    }, 4000);
    return () => clearInterval(heroInterval);
  }, []);

  const handlePrevHero = () => {
    setCurrentHeroSlide((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));
  };

  const handleNextHero = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDragging.current = true;
    isMoved.current = false;
    sliderRef.current.style.cursor = 'grabbing';
    sliderRef.current.style.scrollSnapType = 'none'; // Tắt snap khi đang kéo
    startY.current = e.pageY - sliderRef.current.offsetTop;
    scrollTop.current = sliderRef.current.scrollTop;
  };

  const handleMouseLeave = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
      sliderRef.current.style.scrollSnapType = 'y mandatory'; // Bật lại snap
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
      sliderRef.current.style.scrollSnapType = 'y mandatory';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    e.preventDefault();
    const y = e.pageY - sliderRef.current.offsetTop;
    const walk = (y - startY.current) * 1.5; // Tốc độ cuộn chuột
    if (Math.abs(walk) > 5) {
      isMoved.current = true;
    }
    sliderRef.current.scrollTop = scrollTop.current - walk;
  };

  return (
    <div className="hero-full-container">
      <div className="hero-slider-wrapper">
        {/* <button className="hero-nav-btn prev" onClick={handlePrevHero}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button> */}

        <div 
          className="hero-frame"
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ cursor: 'grab' }}
        >
          {heroImages.map((img, index) => (
            <div
              key={index}
              className="hero-slide"
              style={{
                backgroundImage: `url(${img})`,
                opacity: 1, // Ảnh nào cũng hiện để trượt qua
                pointerEvents: 'auto',
                zIndex: index === currentHeroSlide ? 2 : 1
              }}
              onClick={() => {
                if (!isMoved.current) {
                  onHeroClick(index);
                }
              }}
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