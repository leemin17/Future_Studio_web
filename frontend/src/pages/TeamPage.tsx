import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, LayoutGroup } from 'framer-motion';
import type { TeamMember } from '@shared/types';
import ScrollReveal from '../components/ScrollReveal';
import TeamMemberAdminModal from '../components/TeamMemberAdminModal';
import PartnersSection from '../components/PartnersSection';
import { deleteTeamMember, fetchTeamMembers } from '../services/teamMembers';
import { useAdminSession } from '../hooks/useAdminSession';

const TeamPage = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(true);
    const [membersError, setMembersError] = useState('');
    const isAdmin = useAdminSession();
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [deletingMemberId, setDeletingMemberId] = useState<number | null>(null);
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
    const memberOrderKey = memberIndicesById.join(',');
    const [memberOrderState, setMemberOrderState] = useState(() => ({
        key: memberOrderKey,
        order: [...memberIndicesById],
    }));
    const memberOrder = memberOrderState.key === memberOrderKey
        ? memberOrderState.order
        : memberIndicesById;
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
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
        let active = true;
        void fetchTeamMembers()
            .then((members) => {
                if (!active) return;
                setTeamMembers(members);
                if (!members.length) setMembersError('Chưa có thành viên.');
            })
            .catch((error) => {
                if (!active) return;
                console.warn('Unable to load team members:', error);
                setMembersError('Không thể tải danh sách thành viên.');
            })
            .finally(() => {
                if (active) setMembersLoading(false);
            });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        lastScrollMemberIndex.current = 0;
    }, [memberOrderKey]);

    const currentIndex = memberOrder[0] ?? 0;
    const memberQueue = memberOrder.slice(1);

    const goToMember = useCallback((index: number) => {
        setMemberOrderState(currentState => {
            const previousOrder = currentState.key === memberOrderKey
                ? currentState.order
                : memberIndicesById;
            const previousCurrentIndex = previousOrder[0];
            if (index === previousCurrentIndex || !previousOrder.includes(index)) {
                return currentState.key === memberOrderKey
                    ? currentState
                    : { key: memberOrderKey, order: [...previousOrder] };
            }

            return {
                key: memberOrderKey,
                order: [
                    index,
                    ...previousOrder.filter(memberIndex => memberIndex !== index && memberIndex !== previousCurrentIndex),
                    previousCurrentIndex,
                ],
            };
        });
    }, [memberIndicesById, memberOrderKey]);

    const handlePrev = useCallback(() => {
        if (!memberIndicesById.length) return;
        const currentPosition = memberIndicesById.indexOf(currentIndex);
        const previousPosition = Math.max(0, currentPosition - 1);
        goToMember(memberIndicesById[previousPosition]);
    }, [currentIndex, goToMember, memberIndicesById]);

    const handleNext = useCallback(() => {
        if (!memberIndicesById.length) return;
        const currentPosition = memberIndicesById.indexOf(currentIndex);
        const nextPosition = Math.min(memberIndicesById.length - 1, currentPosition + 1);
        goToMember(memberIndicesById[nextPosition]);
    }, [currentIndex, goToMember, memberIndicesById]);

    useMotionValueEvent(teamCarouselScrollProgress, "change", (latest) => {
        if (selectedMember || isMobile || !memberIndicesById.length) return;
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

    const openCreateMember = () => {
        setEditingMember(null);
        setIsAddMemberOpen(true);
    };

    const openEditMember = (member: TeamMember) => {
        setEditingMember(member);
        setIsAddMemberOpen(true);
    };

    const handleDeleteMember = async (member: TeamMember) => {
        if (!window.confirm(`Xóa vĩnh viễn thành viên "${member.name}"?`)) return;

        setDeletingMemberId(member.id);
        try {
            await deleteTeamMember(member.id);
            setTeamMembers((current) => current.filter((item) => item.id !== member.id));
            if (selectedMember?.id === member.id) setSelectedMember(null);
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Không thể xóa thành viên.');
        } finally {
            setDeletingMemberId(null);
        }
    };

    const showcaseIndex = currentIndex;
    const hasTeamMembers = teamMembers.length > 0;
    const showcaseMember: TeamMember = teamMembers[showcaseIndex] ?? teamMembers[0] ?? {
        id: 0,
        name: membersLoading ? 'Future Studio Team' : 'Team',
        role: '',
        image: 'images/team.jpg',
        color: 'rgba(255, 255, 255, 0.15)',
        bio: membersLoading ? 'Đang tải danh sách thành viên...' : membersError,
    };

    return (
        <div className="teampage-wrapper" style={{ position: 'relative' }}>
            <TeamMemberAdminModal
                open={isAddMemberOpen}
                member={editingMember}
                onClose={() => {
                    setIsAddMemberOpen(false);
                    setEditingMember(null);
                }}
                onSaved={(member) => setTeamMembers((current) => {
                    const alreadyExists = current.some((item) => item.id === member.id);
                    const nextMembers = alreadyExists
                        ? current.map((item) => item.id === member.id ? member : item)
                        : [...current, member];
                    return nextMembers.sort((a, b) => a.id - b.id);
                })}
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
            <PartnersSection />

                <ScrollReveal>
                    <section ref={teamCarouselRef} className={`team-carousel-section team-carousel-section--sticky ${isMobile ? 'team-carousel-section--swipe' : ''}`}>
                        <div className="team-carousel-sticky">
                            <LayoutGroup id="team-showcase-gallery">
                                <div className="team-showcase">
                                    <div className="team-showcase-label">Team</div>
                                    {isAdmin && (
                                        <button type="button" className="team-member-add-button" onClick={openCreateMember}>
                                            <span aria-hidden="true">+</span> Thêm thành viên
                                        </button>
                                    )}

                                    <div
                                        className={`team-showcase-main ${!hasTeamMembers ? 'team-showcase-main--loading' : ''}`}
                                        role="button"
                                        tabIndex={hasTeamMembers ? 0 : -1}
                                        aria-disabled={!hasTeamMembers}
                                        onClick={() => { if (hasTeamMembers) setSelectedMember(showcaseMember); }}
                                        onKeyDown={(event) => {
                                            if (hasTeamMembers && (event.key === 'Enter' || event.key === ' ')) {
                                                event.preventDefault();
                                                setSelectedMember(showcaseMember);
                                            }
                                        }}
                                    >
                                            <AnimatePresence initial={false} mode="sync">
                                                <motion.img
                                                    key={showcaseMember.id}
                                                    src={showcaseMember.image}
                                                    alt={showcaseMember.name}
                                                    draggable={false}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                                />
                                            </AnimatePresence>
                                        {isAdmin && hasTeamMembers && (
                                            <div className="team-member-card-admin-actions" aria-label="Quản lý thành viên">
                                            <button
                                                type="button"
                                                className="team-member-card-edit"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    openEditMember(showcaseMember);
                                                }}
                                                aria-label={`Sửa ${showcaseMember.name}`}
                                            >
                                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l10.5-10.5-4-4L4 16v4Zm12.5-16.5 4 4 1-1a1.4 1.4 0 0 0 0-2l-2-2a1.4 1.4 0 0 0-2 0l-1 1Z" /></svg>
                                                <span>edit</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="team-member-card-delete"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    void handleDeleteMember(showcaseMember);
                                                }}
                                                disabled={deletingMemberId === showcaseMember.id}
                                                aria-label={`Xóa ${showcaseMember.name}`}
                                            >
                                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-1 12H8L7 9Zm3 2v8h2v-8h-2Zm4 0v8h2v-8h-2Z" /></svg>
                                                <span>{deletingMemberId === showcaseMember.id ? 'Đang đuổi' : 'đuổi việc'}</span>
                                            </button>
                                            </div>
                                        )}
                                    </div>

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
                                        {selectedMember.skills?.map((skill, idx) => (
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
