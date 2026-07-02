import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { teamMembers } from '../data/database';

const TeamPage = () => {
    // --- LOGIC CHO CAROUSEL VÔ TẬN ---
    const PADDING_SIZE = 2; // Số lượng item nhân bản ở mỗi đầu
    const extendedMembers = useMemo(() => {
        if (teamMembers.length <= PADDING_SIZE) return teamMembers; // Tránh lỗi nếu mảng quá nhỏ
        const start = teamMembers.slice(-PADDING_SIZE);
        const end = teamMembers.slice(0, PADDING_SIZE);
        return [...start, ...teamMembers, ...end];
    }, []);

    const [currentIndex, setCurrentIndex] = useState(PADDING_SIZE); // Bắt đầu từ item thật đầu tiên
    const [isTransitioning, setIsTransitioning] = useState(true); // Bật transition ban đầu
    const [offset, setOffset] = useState(0);
    const trackWrapperRef = useRef<HTMLDivElement>(null);
    const throttleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --- State cho việc vuốt trên di động ---
    const [isSwiping, setIsSwiping] = useState(false);
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchDeltaX, setTouchDeltaX] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    // const activeIndex = (currentIndex - PADDING_SIZE + teamMembers.length) % teamMembers.length;

    // --- LOGIC ĐỂ TÍNH TOÁN VỊ TRÍ CHO CAROUSEL ---
    useEffect(() => {
        const calculateOffset = () => {
            if (!trackWrapperRef.current) return;

            const wrapperWidth = trackWrapperRef.current.offsetWidth;
            const track = trackWrapperRef.current.querySelector<HTMLDivElement>('.team-carousel-track');

            if (!track || !track.children || track.children.length === 0) return;

            const cards = Array.from(track.children) as HTMLDivElement[];
            const activeCard = cards[currentIndex];

            if (!activeCard) return;

            const activeCardOffsetLeft = activeCard.offsetLeft;
            const activeCardWidth = activeCard.offsetWidth;

            const newOffset = (wrapperWidth / 2) - activeCardOffsetLeft - (activeCardWidth / 2);
            setOffset(newOffset);
        };

        calculateOffset();

        window.addEventListener('resize', calculateOffset);
        return () => {
            window.removeEventListener('resize', calculateOffset);
        };
    }, [currentIndex, isMobile, extendedMembers]); // Thêm isMobile và extendedMembers để tính lại khi cần

    // --- Theo dõi kích thước màn hình để chuyển đổi giữa layout desktop/mobile ---
    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const handleResize = () => setIsMobile(mediaQuery.matches);

        mediaQuery.addEventListener('change', handleResize);
        handleResize(); // Kiểm tra ngay khi component mount

        return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);

    // --- Xử lý khi transition kết thúc để tạo hiệu ứng lặp ---
    const handleTransitionEnd = () => {
        // Khi hiệu ứng lướt tới slide nhân bản kết thúc, ta sẽ thực hiện cú "nhảy"
        // Nếu đang ở slide nhân bản cuối -> nhảy về slide thật đầu tiên
        if (currentIndex === extendedMembers.length - PADDING_SIZE) {
            setIsTransitioning(false); // Tắt transition để "nhảy" tức thì
            // Dùng requestAnimationFrame để đảm bảo việc bật lại transition xảy ra sau khi DOM đã cập nhật
            requestAnimationFrame(() => setCurrentIndex(PADDING_SIZE));
        }
        // Nếu đang ở slide nhân bản đầu -> nhảy về slide thật cuối cùng
        else if (currentIndex === PADDING_SIZE - 1) {
            setIsTransitioning(false); // Tắt transition để "nhảy" tức thì
            requestAnimationFrame(() => setCurrentIndex(extendedMembers.length - PADDING_SIZE - 1));
        } else if (!isTransitioning) {
            // Bật lại transition sau khi đã "nhảy" xong
            setIsTransitioning(true);
        }
    };

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => prev - 1);
        setIsTransitioning(true);
    }, []);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsTransitioning(true);
    }, []);

    // --- HIỆU ỨNG: LƯỚT CAROUSEL BẰNG CON LĂN CHUỘT ---
    useEffect(() => {
        const carousel = trackWrapperRef.current;
        if (!carousel) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault(); // Ngăn trang cuộn dọc

            if (throttleTimeout.current) return; // Nếu đang trong thời gian chờ, không làm gì cả

            if (e.deltaY > 0) {
                handleNext();
            } else {
                handlePrev();
            }

            // Đặt thời gian chờ 500ms trước khi cho phép lăn chuột tiếp
            throttleTimeout.current = setTimeout(() => {
                throttleTimeout.current = null;
            }, 500);
        };

        carousel.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            carousel.removeEventListener('wheel', handleWheel);
            if (throttleTimeout.current) {
                clearTimeout(throttleTimeout.current);
            }
        };
    }, [handleNext, handlePrev]);

    // --- LOGIC VUỐT TRÊN DI ĐỘNG ---
    const handleTouchStart = (e: React.TouchEvent) => {
        // Chỉ bắt đầu vuốt nếu đang không trong thời gian chờ
        if (throttleTimeout.current) return;
        setTouchStartX(e.touches[0].clientX);
        setIsSwiping(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSwiping) return;
        const currentX = e.touches[0].clientX;
        setTouchDeltaX(currentX - touchStartX);
    };

    const handleTouchEnd = () => {
        if (!isSwiping) return;

        const swipeThreshold = 50; // Ngưỡng vuốt tối thiểu (50px)
        if (touchDeltaX < -swipeThreshold) {
            handleNext();
        } else if (touchDeltaX > swipeThreshold) {
            handlePrev();
        }

        // Reset lại trạng thái vuốt
        setIsSwiping(false);
        setTouchDeltaX(0);
        setTouchStartX(0);
    };


    return (
        <section className="team-section">
            <img src="images/team.jpg" alt="Team Banner" className="team-banner" />
            <div className="container">
                {/* Coverflow Carousel */}
                <div className="team-carousel-coverflow">
                    <div className="team-carousel-track-wrapper" ref={trackWrapperRef}>
                        <div
                            className="team-carousel-track"
                            style={{
                                // Khi đang vuốt, ưu tiên vị trí theo tay người dùng để có phản hồi tức thì
                                transform: isSwiping
                                    ? `translateX(${offset + touchDeltaX}px)`
                                    : `translateX(${offset}px)`,
                                // Tắt transition khi đang vuốt để không bị trễ
                                transition: isSwiping || !isTransitioning ? 'none' : 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)'
                            }}
                            onTransitionEnd={handleTransitionEnd}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {extendedMembers.map((member, index) => (
                                <div
                                    key={`${member.id}-${index}`}
                                    className={`polaroid-card-wrapper ${index === currentIndex ? 'active' : ''}`}
                                    onClick={() => { setCurrentIndex(index); setIsTransitioning(true); }}
                                >
                                    <div className="polaroid-card">
                                        <div className="polaroid-image-wrapper">
                                            <img
                                                src={member.image}
                                                alt={`Ảnh của ${member.name}`}
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="polaroid-caption">
                                            <h3>{member.name}</h3>
                                            <p>{member.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TeamPage;