import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, LayoutGroup } from 'framer-motion';
import { teamMembers as fallbackTeamMembers } from '@shared/fallbackData';
import type { TeamMember } from '@shared/types';
import ScrollReveal from '../components/ScrollReveal';
import TeamMemberAdminModal from '../components/TeamMemberAdminModal';
import { supabase } from '../lib/supabase';
import { fetchTeamMembers } from '../services/teamMembers';

const TeamPage = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(fallbackTeamMembers);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const memberIndicesById = useMemo(() => teamMembers
        .map((_, index) => index)
        .sort((firstIndex, secondIndex) => teamMembers[firstIndex].id - teamMembers[secondIndex].id), [teamMembers]);
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
    const [memberOrder, setMemberOrder] = useState(() => [...memberIndicesById]);
    const [selectedMember, setSelectedMember] = useState<any>(null); 
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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

    useEffect(() => {
        if (!supabase) return;
        let active = true;
        void fetchTeamMembers()
            .then((members) => {
                if (active && members.length) setTeamMembers(members);
            })
            .catch((error) => console.warn('Unable to load team members:', error));
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!supabase) return;
        void supabase.auth.getSession().then(({ data }) => setIsAdmin(Boolean(data.session)));
        const { data } = supabase.auth.onAuthStateChange((_event, session) => setIsAdmin(Boolean(session)));
        return () => data.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        setMemberOrder([...memberIndicesById]);
        lastScrollMemberIndex.current = 0;
    }, [memberIndicesById]);

    const currentIndex = memberOrder[0] ?? 0;
    const memberQueue = memberOrder.slice(1);

    const goToMember = useCallback((index: number) => {
        setMemberOrder(previousOrder => {
            const previousCurrentIndex = previousOrder[0];
            if (index === previousCurrentIndex || !previousOrder.includes(index)) return previousOrder;

            return [
                index,
                ...previousOrder.filter(memberIndex => memberIndex !== index && memberIndex !== previousCurrentIndex),
                previousCurrentIndex,
            ];
        });
    }, []);

    const handlePrev = useCallback(() => {
        const currentPosition = memberIndicesById.indexOf(currentIndex);
        const previousPosition = Math.max(0, currentPosition - 1);
        goToMember(memberIndicesById[previousPosition]);
    }, [currentIndex, goToMember]);

    const handleNext = useCallback(() => {
        const currentPosition = memberIndicesById.indexOf(currentIndex);
        const nextPosition = Math.min(memberIndicesById.length - 1, currentPosition + 1);
        goToMember(memberIndicesById[nextPosition]);
    }, [currentIndex, goToMember]);

    useMotionValueEvent(teamCarouselScrollProgress, "change", (latest) => {
        if (selectedMember || isMobile) return;
        const nextPosition = Math.round(latest * (memberIndicesById.length - 1));
        if (nextPosition !== lastScrollMemberIndex.current) {
            goToMember(memberIndicesById[nextPosition]);
            lastScrollMemberIndex.current = nextPosition;
        }
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
        goToMember(index);
    }, [goToMember]);

    const showcaseIndex = currentIndex;
    const showcaseMember = teamMembers[showcaseIndex] ?? teamMembers[0];

    return (
        <div className="teampage-wrapper" style={{ position: 'relative' }}>
            <TeamMemberAdminModal
                open={isAddMemberOpen}
                onClose={() => setIsAddMemberOpen(false)}
                onSaved={(member) => setTeamMembers((current) => [...current, member].sort((a, b) => a.id - b.id))}
            />
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
                                    {isAdmin && (
                                        <button type="button" className="team-member-add-button" onClick={() => setIsAddMemberOpen(true)}>
                                            <span aria-hidden="true">+</span> Thêm thành viên
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="team-showcase-main"
                                        onClick={() => setSelectedMember(showcaseMember)}
                                    >
                                        <motion.img
                                            key={showcaseMember.id}
                                            src={showcaseMember.image}
                                            alt={showcaseMember.name}
                                            draggable={false}
                                            initial={{
                                                scale: 0.992,
                                                opacity: 1
                                            }}
                                            animate={{
                                                scale: 1,
                                                opacity: 1
                                            }}
                                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                        />
                                    </button>

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

                                    <div className="team-showcase-thumbs">
                                        {memberQueue.map((index) => {
                                            const member = teamMembers[index];
                                            if (!member || index === showcaseIndex) return null;

                                            return (
                                                <button
                                                    type="button"
                                                    key={member.id}
                                                    className="team-showcase-thumb"
                                                    onClick={() => handleSelectMember(index)}
                                                    aria-label={`View ${member.name}`}
                                                >
                                                    <img
                                                        src={member.image}
                                                        alt={member.name}
                                                        draggable={false}
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
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
