import React, { useRef, useEffect } from 'react';
import { teamMembers } from '../data/database';

const TeamPage = () => {
    const carouselRef = useRef<HTMLDivElement>(null);

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

                <div className="carousel-container" ref={carouselRef}>
                    {teamMembers.map((member) => (
                        <div key={member.id} className="polaroid-card">
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