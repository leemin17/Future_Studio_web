import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { teamMembers } from '../data/database';

const TeamPage = () => {
    // --- LOGIC HIỆU ỨNG MOTTO (SCROLL HIJACKING) ---
    const scrollProgress = useMotionValue(0);
    
    // Sử dụng useSpring để hiệu ứng mượt mà, không bị giật
    const smoothProgress = useSpring(scrollProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Ánh xạ tiến trình (0 -> 1) sang opacity và scale
    // 0 -> 0.5: Hiện dần | 0.5 -> 1: Mất dần
    const opacity = useTransform(smoothProgress, [0, 0.5, 1], [0, 1, 0]);
    const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

    const handleWheel = (e: React.WheelEvent) => {
        const current = scrollProgress.get();
        const delta = e.deltaY;
        
        // delta / 1000 là tốc độ cuộn. Tăng số này nếu muốn cuộn chậm hơn.
        const next = Math.max(0, Math.min(1, current + delta / 1000));
        
        scrollProgress.set(next);

        // Chặn cuộn trang mặc định nếu hiệu ứng đang chạy (chưa đạt 0 hoặc 1)
        if (next > 0 && next < 1) {
            e.preventDefault();
        }
    };

    // --- LOGIC CAROUSEL ---
    const { scrollYProgress } = useScroll();
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [offset, setOffset] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchDeltaX, setTouchDeltaX] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const trackWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const calculateOffset = () => {
            if (!trackWrapperRef.current) return;
            const wrapperWidth = trackWrapperRef.current.offsetWidth;
            const track = trackWrapperRef.current.querySelector<HTMLDivElement>('.team-carousel-track');
            if (!track?.children.length) return;

            const activeCard = Array.from(track.children)[currentIndex] as HTMLDivElement;
            const newOffset = (wrapperWidth / 2) - activeCard.offsetLeft - (activeCard.offsetWidth / 2);
            setOffset(newOffset);
        };
        calculateOffset();
        window.addEventListener('resize', calculateOffset);
        return () => window.removeEventListener('resize', calculateOffset);
    }, [currentIndex, isMobile]);

    const handlePrev = useCallback(() => setCurrentIndex(p => Math.max(0, p - 1)), []);
    const handleNext = useCallback(() => setCurrentIndex(p => Math.min(teamMembers.length - 1, p + 1)), []);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.touches[0].clientX);
        setIsSwiping(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSwiping) return;
        setTouchDeltaX(e.touches[0].clientX - touchStartX);
    };

    const handleTouchEnd = () => {
        if (!isSwiping) return;
        if (touchDeltaX < -50) handleNext();
        else if (touchDeltaX > 50) handlePrev();
        setIsSwiping(false);
        setTouchDeltaX(0);
    };

    return (
        <div className="teampage-wrapper">
            <motion.div className="page-scroll-progress-bar" style={{ scaleX: scrollYProgress }} />

            <div className="team-stacking-container">
                <section className="team-banner-section">
                    <img src="images/team.jpg" alt="Team Banner" className="team-banner" />
                </section>
                
                {/* Section Motto - Bắt sự kiện cuộn tại đây */}
                <section 
                    className="motto-section" 
                    onWheel={handleWheel}
                    style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
                >
                    <motion.div 
                        className="motto-modern"
                        style={{ opacity, scale }}
                    >
                        <h2 className="motto-text">
                            "Excellence is not an act, but a habit. We <span className="motto-highlight">shape the future</span> through the solid steps we take today."
                        </h2>
                        <p className="motto-author">Your Company Name</p>
                    </motion.div>
                </section>

                <section className="team-carousel-section">
                    <div className="container">
                        <div className="team-carousel-coverflow">
                            <div className="team-carousel-track-wrapper" ref={trackWrapperRef}>
                                <motion.div
                                    className="team-carousel-track"
                                    style={{ 
                                        transform: `translateX(${offset + (isSwiping ? touchDeltaX : 0)}px)`,
                                        transition: isSwiping ? 'none' : 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)'
                                    }}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    {teamMembers.map((member, index) => (
                                        <motion.div
                                            key={member.id}
                                            className={`polaroid-card-wrapper ${index === currentIndex ? 'active' : ''}`}
                                            onClick={() => setCurrentIndex(index)}
                                            animate={{ scale: index === currentIndex ? 1.1 : 1 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        >
                                            <div className="polaroid-card">
                                                <div className="polaroid-image-wrapper">
                                                    <img src={member.image} alt={member.name} loading="lazy" />
                                                </div>
                                                <div className="polaroid-caption">
                                                    <h3>{member.name}</h3>
                                                    <p>{member.role}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                            
                            <div className="carousel-controls">
                                <button className="btn-arrow" onClick={handlePrev} disabled={currentIndex === 0}>←</button>
                                <button className="btn-arrow" onClick={handleNext} disabled={currentIndex === teamMembers.length - 1}>→</button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TeamPage;