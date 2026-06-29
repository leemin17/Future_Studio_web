import React, { useRef, useEffect, useMemo } from 'react';
import { teamMembers } from '../data/database';

const TeamPage = () => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false); // Ref để theo dõi trạng thái cuộn do code gây ra

    // Nhân đôi danh sách thành viên để tạo hiệu ứng lặp lại
    const duplicatedMembers = useMemo(() => [...teamMembers, ...teamMembers], []);

    // Thiết lập vị trí cuộn ban đầu để có thể cuộn sang trái
    useEffect(() => {
        const carousel = carouselRef.current;
        if (carousel) {
            const scrollWidth = carousel.scrollWidth;
            const clientWidth = carousel.clientWidth;
            // Đặt vị trí cuộn ở giữa, tức là điểm bắt đầu của bản sao thứ hai
            carousel.scrollLeft = (scrollWidth - clientWidth) / 2;
        }
    }, []);

    const handleScroll = () => {
        if (isScrollingRef.current) return; // Bỏ qua nếu đang cuộn do code

        const carousel = carouselRef.current;
        if (carousel) {
            const { scrollLeft, scrollWidth, clientWidth } = carousel;
            const itemWidth = scrollWidth / duplicatedMembers.length;

            // Khi cuộn gần đến cuối (bản sao thứ hai)
            if (scrollLeft + clientWidth >= scrollWidth - itemWidth) {
                isScrollingRef.current = true;
                carousel.scrollLeft = scrollLeft - (scrollWidth / 2);
                setTimeout(() => { isScrollingRef.current = false; }, 50);
            }
            // Khi cuộn gần về đầu (bản sao đầu tiên)
            else if (scrollLeft <= itemWidth) {
                isScrollingRef.current = true;
                carousel.scrollLeft = scrollLeft + (scrollWidth / 2);
                setTimeout(() => { isScrollingRef.current = false; }, 50);
            }
        }
    };

    const scroll = (scrollOffset: number) => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
        }
    };

    // HIỆU ỨNG: Lướt ngang carousel bằng con lăn chuột
    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        const handleWheel = (e: WheelEvent) => {
            // Nếu người dùng lăn chuột, ngăn hành vi cuộn dọc mặc định của trang
            e.preventDefault();

            // Cuộn carousel theo chiều ngang, giá trị deltaY là khoảng cách lăn chuột
            carousel.scrollBy({
                left: e.deltaY,
                behavior: 'auto' // Dùng 'auto' để cuộn tức thì, tạo cảm giác phản hồi nhanh
            });
        };

        carousel.addEventListener('wheel', handleWheel, { passive: false });
        return () => carousel.removeEventListener('wheel', handleWheel);
    }, []);

    return (
        <section className="team-section">
            <div className="team-carousel-wrapper">
                <button className="btn-arrow team-nav-btn prev" onClick={() => scroll(-320)} aria-label="Thành viên trước">
                    &lt;
                </button>

                <div className="carousel-container" ref={carouselRef} onScroll={handleScroll}>
                    {duplicatedMembers.map((member, index) => (
                        <div key={`${member.id}-${index}`} className="polaroid-card">
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
                    ))}
                </div>

                <button className="btn-arrow team-nav-btn next" onClick={() => scroll(320)} aria-label="Thành viên kế tiếp">
                    &gt;
                </button>
            </div>
        </section>
    );
};

export default TeamPage;