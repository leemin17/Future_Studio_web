import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { teamMembers } from '../data/database';
import ScrollReveal from '../components/ScrollReveal'; // Import ScrollReveal

const TeamPage = () => {
    // --- LOGIC HIỆU ỨNG MOTTO (NATURAL SCROLL) ---
    const mottoRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: mottoScrollProgress } = useScroll({
        target: mottoRef,
        offset: ["start center", "end center"] // Bắt đầu animation khi giữa section chạm giữa viewport, kết thúc khi cuối section chạm giữa viewport
    });

    // Ánh xạ tiến trình (0 -> 1) sang opacity và scale
    // 0 -> 0.5: Hiện dần | 0.5 -> 1: Mất dần
    const opacity = useTransform(mottoScrollProgress, [0, 0.5, 1], [0, 1, 0]);
    const scale = useTransform(mottoScrollProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

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
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                <ScrollReveal>
                    <section className="team-banner-section">
                        <img src="images/team.jpg" alt="Team Banner" className="team-banner" />
                    </section>
                </ScrollReveal>
                
                {/* Section Motto - Hiệu ứng được điều khiển bằng vị trí cuộn tự nhiên */}
                <ScrollReveal>
                    <section
                        ref={mottoRef}
                        className="motto-section"
                        style={{ height: "200vh", position: "relative" }} // Tăng chiều cao để có không gian cuộn
                    >
                        <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                            <motion.div
                                className="motto-modern"
                                style={{ opacity, scale }}
                            >
                                <h2 className="motto-text">
                                    "Excellence is not an act, but a habit. We <span className="motto-highlight">shape the future</span> through the solid steps we take today."
                                </h2>
                                <p className="motto-author">Your Company Name</p>
                            </motion.div>
                        </div>
                    </section>
                </ScrollReveal>

                <ScrollReveal>
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
                                        {teamMembers.map((member, index) => {
                                            const distance = index - currentIndex;
                                            const zIndex = teamMembers.length - Math.abs(distance);
                                            return (
                                                <motion.div
                                                    key={member.id}
                                                    className={`polaroid-card-wrapper ${index === currentIndex ? 'active' : ''}`}
                                                    onClick={() => setCurrentIndex(index)}
                                                    animate={{
                                                        rotateY: distance * -35, // Góc xoay cho các thẻ ở xa
                                                        scale: 1 - Math.abs(distance) * 0.15, // Thu nhỏ các thẻ ở xa
                                                        zIndex: zIndex, // Đưa thẻ gần hơn lên trước
                                                        x: `${distance * 50}%`, // Dịch chuyển các thẻ để chúng không chồng hoàn toàn lên nhau
                                                    }}
                                                    transition={{ type: 'spring', stiffness: 250, damping: 25 }}
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
                                            );
                                        })}
                                    </motion.div>
                                </div>
                                
                                <div className="carousel-controls">
                                    <button className="btn-arrow" onClick={handlePrev} disabled={currentIndex === 0}>←</button>
                                    <button className="btn-arrow" onClick={handleNext} disabled={currentIndex === teamMembers.length - 1}>→</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </ScrollReveal>
            </div>
        </div>
    );
};

export default TeamPage;