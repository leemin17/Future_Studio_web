import React, { useState, useEffect } from 'react';

// Tạo mảng ảnh mock trực tiếp trong file này cho nhanh và đỡ lỗi import đường dẫn
const heroImages = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop', // Ảnh ví dụ nghệ thuật dạng 3D
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1965&auto=format&fit=crop'
];

interface HeroSliderProps {
    onHeroClick: (index: number) => void;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ onHeroClick }) => {
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
                <button className="hero-nav-btn prev" onClick={handlePrevHero}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>

                <div className="hero-frame">
                    {heroImages.map((img, index) => (
                        <div
                            key={index}
                            className="hero-slide"
                            style={{
                                backgroundImage: `url(${img})`,
                                opacity: index === currentHeroSlide ? 1 : 0,
                                cursor: 'pointer'
                            }}
                            onClick={() => onHeroClick(index)}
                        />
                    ))}

                    <div className="hero-dots">
                        {heroImages.map((_, index) => (
                            <div
                                key={index}
                                onClick={() => setCurrentHeroSlide(index)}
                                className={`hero-dot ${index === currentHeroSlide ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                <button className="hero-nav-btn next" onClick={handleNextHero}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>

            <div className="hero-bottom-action">
                <button className="btn-dozo-about">Future Studio là gì?</button>
            </div>
        </div>
    );
};

export default HeroSlider;