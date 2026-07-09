import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { teamMembers } from '../data/database';
import ScrollReveal from '../components/ScrollReveal';

const TeamPage = () => {
    // --- LOGIC HIỆU ỨNG MOTTO (NATURAL SCROLL) ---
    const mottoRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: mottoScrollProgress } = useScroll({
        target: mottoRef,
        offset: ["start center", "end center"]
    });

    const opacity = useTransform(mottoScrollProgress, [0, 0.5, 1], [0, 1, 0]);
    const scale = useTransform(mottoScrollProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

    // --- LOGIC CAROUSEL & MODAL ---
    const { scrollYProgress } = useScroll();
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [offset, setOffset] = useState(0);
    const [selectedMember, setSelectedMember] = useState<any>(null); 
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

    // --- ĐIỀU KHIỂN BẰNG BÀN PHÍM ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePrev, handleNext]);

    // --- LOGIC CUSTOM CURSOR & INTERACTIVE ZONE ---
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [cursorDirection, setCursorDirection] = useState<'left' | 'right' | null>(null);
    const [isCursorOverCard, setIsCursorOverCard] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
        const cards = trackWrapperRef.current?.querySelectorAll<HTMLDivElement>('.polaroid-card-wrapper');
        const isOverCard = cards
            ? Array.from(cards).some((card) => {
                const rect = card.getBoundingClientRect();
                return e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
            })
            : false;

        if (isOverCard) {
            setIsCursorOverCard(true);
            setCursorDirection(null);
            return;
        }

        setIsCursorOverCard(false);
        const { width, left } = e.currentTarget.getBoundingClientRect();
        const xPosition = e.clientX - left;
        if (xPosition < width / 2) {
            setCursorDirection('left');
        } else {
            setCursorDirection('right');
        }
    };

    const handleMouseLeave = () => {
        setCursorDirection(null);
        setIsCursorOverCard(false);
    };

    const handleZoneClick = (e: React.MouseEvent) => {
        const cards = trackWrapperRef.current?.querySelectorAll<HTMLDivElement>('.polaroid-card-wrapper');
        const clickedIndex = cards
            ? Array.from(cards).findIndex((card) => {
                const rect = card.getBoundingClientRect();
                return e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
            })
            : -1;

        if (clickedIndex >= 0) {
            if (clickedIndex === currentIndex) {
                setSelectedMember(teamMembers[clickedIndex]);
            } else {
                setCurrentIndex(clickedIndex);
            }
            return;
        }

        if (cursorDirection === 'left') handlePrev();
        if (cursorDirection === 'right') handleNext();
    };

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
        <div className="teampage-wrapper" style={{ position: 'relative' }}>
            <motion.div className="page-scroll-progress-bar" style={{ scaleX: scrollYProgress }} />

            <motion.div 
                className="custom-carousel-cursor"
                animate={{
                    x: mousePos.x - 16, // ĐÃ SỬA: 32px chia 2 = 16px
                    y: mousePos.y - 16, // ĐÃ SỬA: 32px chia 2 = 16px
                    opacity: cursorDirection ? 1 : 0,
                    scale: cursorDirection ? 1 : 0
                }}
                transition={{
                    x: { duration: 0 },
                    y: { duration: 0 },
                    opacity: { duration: 0.15 },
                    scale: { duration: 0.15 }
                }}
            >
                <span>
                    {cursorDirection && (
                        <img 
                            src="icon/arrow.png" 
                            alt="Arrow" 
                            className={`cursor-arrow-icon ${cursorDirection === 'left' ? 'flipped' : ''}`}
                        />
                    )}
                </span>
            </motion.div>

            <div className="team-stacking-container">
                <ScrollReveal>
                    <section className="team-banner-section">
                        <img src="images/team.jpg" alt="Team Banner" className="team-banner" />
                    </section>
                </ScrollReveal>
                
                <ScrollReveal>
                    <section
                        ref={mottoRef}
                        className="motto-section"
                        style={{ height: "200vh", position: "relative" }}
                    >
                        <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                            <motion.div
                                className="motto-modern"
                                style={{ opacity, scale }}
                            >
                                <h2 className="motto-text">
                                    "Excellence is not an act, but a habit. We <span className="motto-highlight">shape the future</span> through the solid steps we take today."
                                </h2>
                                <p className="motto-author">Future Studio</p>
                            </motion.div>
                        </div>
                    </section>
                </ScrollReveal>

                <ScrollReveal>
                    <section className="team-carousel-section" style={{ position: 'relative', overflow: 'hidden' }}>
                        
                        {/* 1. LỚP NỀN ĐỘNG (DYNAMIC BACKGROUND) */}
                        <motion.div 
                            className="carousel-dynamic-bg"
                            animate={{
                                opacity: isMobile ? 0.28 : 0.42,
                                scale: isMobile ? 1 : 1.04,
                            }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                        />

                        <div className="container">
                            <div className="team-carousel-coverflow">
                                
                                <div 
                                    className={`carousel-interactive-zone ${isCursorOverCard ? 'is-over-card' : ''}`}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={handleZoneClick}
                                />
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
                                            const isActive = index === currentIndex;

                                            return (
                                                <motion.div
                                                    key={member.id}
                                                    className={`polaroid-card-wrapper ${isActive ? 'active' : ''}`}
                                                    onClick={() => {
                                                        if (isActive) {
                                                            setSelectedMember(member);
                                                        } else {
                                                            setCurrentIndex(index);
                                                        }
                                                    }}
                                                    animate={{
                                                        rotateY: distance * -35,
                                                        scale: 1 - Math.abs(distance) * 0.15,
                                                        zIndex: zIndex,
                                                        x: `${distance * 50}%`,
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
                            </div>
                        </div>
                    </section>
                </ScrollReveal>
            </div>

            {/* 3. MODAL CHI TIẾT THÀNH VIÊN */}
            <AnimatePresence>
                {selectedMember && (
                    <motion.div 
                        className="member-modal-backdrop"
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        onClick={() => setSelectedMember(null)} 
                    >
                        <motion.div 
                            className="member-modal-content"
                            initial={{ y: 50, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()} 
                        >
                            <button className="modal-close-btn" onClick={() => setSelectedMember(null)}>×</button>
                            
                            <div className="modal-grid">
                                <div className="modal-image">
                                    <img src={selectedMember.image} alt={selectedMember.name} />
                                </div>
                                <div className="modal-info">
                                    <h2>{selectedMember.name}</h2>
                                    <h4>{selectedMember.role}</h4>
                                    <p className="modal-bio">{selectedMember.bio}</p>
                                    
                                    <div className="modal-skills">
                                        {selectedMember.skills?.map((skill: any, idx: number) => (
                                            <div key={idx} className="skill-item">
                                                <div className="skill-header">
                                                    <span>{skill.name}</span>
                                                    <span>{skill.level}%</span>
                                                </div>
                                                <div className="skill-bar-bg">
                                                    <motion.div 
                                                        className="skill-bar-fill" 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${skill.level}%` }}
                                                        transition={{ duration: 1, delay: 0.3 }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeamPage;
