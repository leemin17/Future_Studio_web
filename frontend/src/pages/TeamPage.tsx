import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, LayoutGroup } from 'framer-motion';
import { teamMembers } from '@data/database';
import ScrollReveal from '../components/ScrollReveal';

const TeamPage = () => {
    // --- LOGIC HIỆU ỨNG MOTTO (NATURAL SCROLL) ---
    const mottoRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: mottoScrollProgress } = useScroll({
        target: mottoRef,
        offset: ["start center", "end center"]
    });

    const opacity = useTransform(mottoScrollProgress, [0, 0.12, 0.26, 0.55, 1], [0, 1, 1, 1, 0]);
    const scale = useTransform(mottoScrollProgress, [0, 0.18, 0.28, 0.55, 1], [0.94, 1, 1, 1, 0.94]);
    const lift = useTransform(mottoScrollProgress, [0, 0.18, 0.28, 1], [18, 0, 0, -10]);
    const textRevealProgress = useTransform(mottoScrollProgress, [0.08, 0.34], [0, 1]);
    const firstTextOpacity = useTransform(textRevealProgress, [0, 0.22], [0, 1]);
    const firstTextY = useTransform(textRevealProgress, [0, 0.28], [56, 0]);
    const firstTextBlur = useTransform(textRevealProgress, [0, 0.28], ["blur(12px)", "blur(0px)"]);
    const secondTextOpacity = useTransform(textRevealProgress, [0.2, 0.48], [0, 1]);
    const secondTextY = useTransform(textRevealProgress, [0.2, 0.52], [56, 0]);
    const secondTextBlur = useTransform(textRevealProgress, [0.2, 0.52], ["blur(12px)", "blur(0px)"]);
    const thirdTextOpacity = useTransform(textRevealProgress, [0.42, 0.72], [0, 1]);
    const thirdTextY = useTransform(textRevealProgress, [0.42, 0.78], [56, 0]);
    const thirdTextBlur = useTransform(textRevealProgress, [0.42, 0.78], ["blur(12px)", "blur(0px)"]);
    const authorOpacity = useTransform(textRevealProgress, [0.68, 1], [0, 1]);
    const authorY = useTransform(textRevealProgress, [0.68, 1], [32, 0]);

    // --- LOGIC CAROUSEL & MODAL ---
    const { scrollYProgress } = useScroll();
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [memberQueue, setMemberQueue] = useState(() => teamMembers.map((_, index) => index).filter(index => index !== 0));
    const [selectedMember, setSelectedMember] = useState<any>(null); 
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [slideDirection, setSlideDirection] = useState(1);
    const lastScrollMemberIndex = useRef(0);
    const teamCarouselRef = useRef<HTMLElement>(null);
    const { scrollYProgress: teamCarouselScrollProgress } = useScroll({
        target: teamCarouselRef,
        offset: ["start start", "end end"]
    });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const goToMember = useCallback((index: number, direction = 1) => {
        if (index === currentIndex) return;

        setSlideDirection(direction);
        setMemberQueue(previousQueue => [
            ...previousQueue.filter(memberIndex => memberIndex !== index && memberIndex !== currentIndex),
            currentIndex
        ]);
        setCurrentIndex(index);
    }, [currentIndex]);

    const rotateToNextMember = useCallback(() => {
        setSlideDirection(1);
        setMemberQueue(previousQueue => {
            const [nextIndex, ...restQueue] = previousQueue;
            if (nextIndex === undefined) return previousQueue;

            setCurrentIndex(previousCurrentIndex => {
                if (nextIndex === previousCurrentIndex) return previousCurrentIndex;
                return nextIndex;
            });

            return [...restQueue, currentIndex];
        });
    }, [currentIndex]);

    const handlePrev = useCallback(() => {
        goToMember(Math.max(0, currentIndex - 1), -1);
    }, [currentIndex, goToMember]);

    const handleNext = useCallback(() => {
        goToMember(Math.min(teamMembers.length - 1, currentIndex + 1), 1);
    }, [currentIndex, goToMember]);

    useMotionValueEvent(teamCarouselScrollProgress, "change", (latest) => {
        if (selectedMember || isMobile) return;
        const nextIndex = Math.round(latest * (teamMembers.length - 1));
        if (nextIndex > lastScrollMemberIndex.current) {
            rotateToNextMember();
        } else if (nextIndex < lastScrollMemberIndex.current) {
            goToMember(nextIndex, -1);
        }
        lastScrollMemberIndex.current = nextIndex;
    });

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

    const handleSelectMember = useCallback((index: number) => {
        goToMember(index, 1);
    }, [goToMember]);

    const showcaseIndex = currentIndex;
    const showcaseMember = teamMembers[showcaseIndex] ?? teamMembers[0];

    return (
        <div className="teampage-wrapper" style={{ position: 'relative' }}>
            <motion.div className="page-scroll-progress-bar" style={{ scaleX: scrollYProgress }} />

            <div className={`team-stacking-container ${isMobile ? 'team-stacking-container--mobile' : ''}`}>
                <ScrollReveal>
                    <section className="team-banner-section">
                        <img src="images/team.jpg" alt="Team Banner" className="team-banner" />
                    </section>
                </ScrollReveal>
                
                <ScrollReveal>
                    <section
                        ref={mottoRef}
                        className="motto-section"
                        style={{ position: "relative" }}
                    >
                        <div className="motto-fixed-frame">
                            <motion.div
                                className="motto-quote-card"
                                style={{ opacity, scale, y: lift }}
                            >
                                <blockquote className="motto-text">
                                    <motion.span
                                        className="motto-line"
                                        style={{ opacity: firstTextOpacity, y: firstTextY, filter: firstTextBlur }}
                                    >
                                        "We don’t just create;
                                    </motion.span>
                                    <motion.span
                                        className="motto-line"
                                        style={{ opacity: secondTextOpacity, y: secondTextY, filter: secondTextBlur }}
                                    >
                                        <span className="motto-highlight">we shape identities!</span>
                                    </motion.span>
                                    <motion.span
                                        className="motto-line"
                                        style={{ opacity: thirdTextOpacity, y: thirdTextY, filter: thirdTextBlur }}
                                    >
                                        From TVCs to CGI and mascots. Every project reflects our unique vision."
                                    </motion.span>
                                </blockquote>
                                <motion.p className="motto-author" style={{ opacity: authorOpacity, y: authorY }}>
                                    Future Studio
                                </motion.p>
                            </motion.div>
                        </div>
                    </section>
                </ScrollReveal>

                <ScrollReveal>
                    <section ref={teamCarouselRef} className={`team-carousel-section team-carousel-section--sticky ${isMobile ? 'team-carousel-section--swipe' : ''}`}>
                        <div className="team-carousel-sticky">
                            <LayoutGroup id="team-showcase-gallery">
                                <div className="team-showcase">
                                    <div className="team-showcase-label">Team</div>

                                    <motion.button
                                        type="button"
                                        className="team-showcase-main"
                                        onClick={() => setSelectedMember(showcaseMember)}
                                        layout
                                        transition={{ type: "spring", stiffness: 190, damping: 32, mass: 0.72 }}
                                    >
                                        <AnimatePresence initial={false}>
                                            <motion.img
                                                key={showcaseMember.id}
                                                src={showcaseMember.image}
                                                alt={showcaseMember.name}
                                                loading="lazy"
                                                initial={{
                                                    rotateZ: slideDirection * 2.2,
                                                    y: 18,
                                                    scale: 0.97,
                                                    opacity: 0.68
                                                }}
                                                animate={{
                                                    rotateZ: 0,
                                                    y: 0,
                                                    scale: 1,
                                                    opacity: 1
                                                }}
                                                exit={{
                                                    rotateZ: slideDirection * -2.8,
                                                    y: 38,
                                                    scale: 0.93,
                                                    opacity: 0.55
                                                }}
                                                transition={{ type: "spring", stiffness: 170, damping: 30, mass: 0.82 }}
                                            />
                                        </AnimatePresence>
                                    </motion.button>

                                    <motion.div
                                        className="team-showcase-info"
                                        key={`${showcaseMember.id}-info`}
                                        initial="hidden"
                                        animate="show"
                                        variants={{
                                            hidden: { opacity: 1 },
                                            show: {
                                                opacity: 1,
                                                transition: { staggerChildren: 0.08, delayChildren: 0.12 }
                                            }
                                        }}
                                    >
                                        <motion.h2
                                            variants={{
                                                hidden: { opacity: 0, y: 34, filter: "blur(8px)" },
                                                show: { opacity: 1, y: 0, filter: "blur(0px)" }
                                            }}
                                            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                                        >
                                            {showcaseMember.name}
                                        </motion.h2>
                                        <motion.p
                                            className="team-showcase-role"
                                            variants={{
                                                hidden: { opacity: 0, y: 24 },
                                                show: { opacity: 1, y: 0 }
                                            }}
                                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                        >
                                            {showcaseMember.role}
                                        </motion.p>
                                        <motion.p
                                            className="team-showcase-bio"
                                            variants={{
                                                hidden: { opacity: 0, y: 24 },
                                                show: { opacity: 1, y: 0 }
                                            }}
                                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                        >
                                            {showcaseMember.bio}
                                        </motion.p>
                                    </motion.div>

                                    <motion.div className="team-showcase-thumbs" layout transition={{ duration: 0.54, ease: [0.76, 0, 0.24, 1] }}>
                                        {memberQueue.map((index) => {
                                            const member = teamMembers[index];
                                            if (!member || index === showcaseIndex) return null;

                                            return (
                                                <motion.button
                                                    type="button"
                                                    key={member.id}
                                                    className="team-showcase-thumb"
                                                    onPointerDown={() => handleSelectMember(index)}
                                                    onFocus={() => handleSelectMember(index)}
                                                    aria-label={`View ${member.name}`}
                                                    layout
                                                    animate={{
                                                        x: 0,
                                                        rotateZ: 0,
                                                        opacity: 1
                                                    }}
                                                    transition={{ type: "spring", stiffness: 170, damping: 30, mass: 0.82 }}
                                                >
                                                    <img
                                                        src={member.image}
                                                        alt={member.name}
                                                        loading="lazy"
                                                    />
                                                </motion.button>
                                            );
                                        })}
                                    </motion.div>
                                </div>
                            </LayoutGroup>
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
                            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
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
