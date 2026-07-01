<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
=======
import React, { useRef, useEffect } from 'react';
>>>>>>> 2eef6a03590428a3b58b41b7b4a72495670e7b8d
import { heroImages } from '../data/database';
import { useNavigate } from 'react-router-dom';

const HeroSlider: React.FC = () => {
  const navigate = useNavigate();
  const heroFrameRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false); // Cờ đánh dấu người dùng có đang vuốt/lăn chuột không
  const interactTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exactScrollTop = useRef(0); // Lưu giá trị cuộn dạng số thập phân chính xác
  const scrollDirection = useRef(1); // 1: tự động trôi xuống, -1: tự động trôi lên

<<<<<<< HEAD
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);
  const isMoved = useRef(false);

  useEffect(() => {
    const heroInterval = setInterval(() => {
      setCurrentHeroSlide((prevIndex) => {
        const nextIndex = (prevIndex + 1) % heroImages.length;
        if (sliderRef.current) {
          const slideHeight = sliderRef.current.clientHeight;
          sliderRef.current.scrollTo({
            top: nextIndex * slideHeight,
            behavior: 'smooth'
          });
        }
        return nextIndex;
      });
    }, 4000);
    return () => clearInterval(heroInterval);
=======
  // Biến hỗ trợ thao tác nắm kéo (Drag) bằng chuột trên máy tính
  const isDragging = useRef(false);
  const lastX = useRef(0); // Thêm theo dõi trục X để chống lỗi kéo chéo
  const lastY = useRef(0); // Thay vì lưu điểm bắt đầu cố định, ta lưu điểm ngay trước đó để kéo mượt
  const dragDistance = useRef(0);

  // Hàm khi người dùng giữ tay / giữ chuột
  const handleInteractStart = () => {
    isInteracting.current = true; // Tạm dừng cuộn tự động
    if (interactTimeout.current) {
      clearTimeout(interactTimeout.current);
    }
  };

  // Khởi tạo giữ và kéo chuột
  const handleMouseDown = (e: React.MouseEvent) => {
    handleInteractStart();
    isDragging.current = true;
    dragDistance.current = 0;
    lastX.current = e.clientX;
    lastY.current = e.clientY;
    if (heroFrameRef.current) {
      heroFrameRef.current.style.cursor = 'grabbing'; // Đổi trỏ chuột thành hình nắm chặt
    }
  };

  // Xử lý chạm trên màn hình cảm ứng (Điện thoại / Tablet / Trackpad)
  const handleTouchStart = (e: React.TouchEvent) => {
    handleInteractStart();
    isDragging.current = true; // Bật cờ này để đồng bộ hóa với sự kiện nhấc tay (touchend) toàn cục
    dragDistance.current = 0;
    lastX.current = e.touches[0].clientX;
    lastY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - lastX.current;
    const deltaY = e.touches[0].clientY - lastY.current;
    dragDistance.current += Math.abs(deltaX) + Math.abs(deltaY);
    lastX.current = e.touches[0].clientX;
    lastY.current = e.touches[0].clientY;
  };

  // Hàm khi người dùng thả tay / nhấc chuột hoặc lăn con lăn chuột
  const handleInteractEnd = () => {
    isDragging.current = false;
    if (interactTimeout.current) {
      clearTimeout(interactTimeout.current);
    }
    // Gia hạn 50ms chờ xem trình duyệt có tạo lực quán tính (momentum) không
    interactTimeout.current = setTimeout(() => {
      isInteracting.current = false;
    }, 50);
  };

  // Lắng nghe sự kiện kéo chuột trên TOÀN BỘ WINDOW để không bị mất kéo khi lướt chuột ra ngoài khung
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !heroFrameRef.current) return;
      const deltaX = e.clientX - lastX.current;
      const deltaY = e.clientY - lastY.current;
      dragDistance.current += Math.abs(deltaX) + Math.abs(deltaY); // Cộng dồn khoảng cách kéo
      
      heroFrameRef.current.scrollTop -= deltaY; // Trừ đi khoảng lệch tương đối
      exactScrollTop.current = heroFrameRef.current.scrollTop;
      lastX.current = e.clientX;
      lastY.current = e.clientY; // Cập nhật lại tọa độ mới
    };

    const handleGlobalMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        if (heroFrameRef.current) {
          heroFrameRef.current.style.cursor = 'grab'; // Trả lại trỏ chuột bàn tay mở
        }
        if (interactTimeout.current) clearTimeout(interactTimeout.current);
        interactTimeout.current = setTimeout(() => {
          isInteracting.current = false;
        }, 50);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    window.addEventListener('touchcancel', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
      window.removeEventListener('touchcancel', handleGlobalMouseUp);
    };
>>>>>>> 2eef6a03590428a3b58b41b7b4a72495670e7b8d
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const scrollSpeed = 0.6; // Đã giảm nhẹ tốc độ để trôi êm hơn

    // Khởi tạo vị trí ban đầu nằm ở đoạn giữa (set thứ 2) để có không gian đệm vuốt cả 2 chiều
    if (heroFrameRef.current) {
      const listHeight = heroFrameRef.current.scrollHeight / 3;
      heroFrameRef.current.scrollTop = listHeight;
      exactScrollTop.current = listHeight;
    }

    const autoScroll = () => {
      if (heroFrameRef.current) {
        const listHeight = heroFrameRef.current.scrollHeight / 3;
        let currentScrollTop = heroFrameRef.current.scrollTop;

        // 1. KIỂM TRA LỰC QUÁN TÍNH (MOMENTUM) TỰ NHIÊN CỦA TRÌNH DUYỆT
        const nativeDelta = currentScrollTop - exactScrollTop.current;
          
        // Ngưỡng 10px để tránh lỗi trễ đồng bộ DOM scrollTop trên điện thoại gây kẹt hiệu ứng
        if (Math.abs(nativeDelta) > 10) {
          isInteracting.current = true; // Xác nhận quán tính đang nắm quyền cuộn
          
          if (nativeDelta > 0) {
            scrollDirection.current = 1; // Vuốt xuống
          } else if (nativeDelta < 0) {
            scrollDirection.current = -1; // Vuốt lên
          }
          
          // Gia hạn 50ms trong lúc quán tính vẫn còn chạy
          if (interactTimeout.current) clearTimeout(interactTimeout.current);
          interactTimeout.current = setTimeout(() => {
            isInteracting.current = false;
          }, 50);
        }

        // 2. ĐỒNG BỘ VỊ TRÍ
        if (isInteracting.current) {
          // Nương theo lực cuộn thực tế của trình duyệt
          exactScrollTop.current = currentScrollTop;
        } else {
          // Chủ động trôi tự động mượt mà
          exactScrollTop.current += scrollSpeed * scrollDirection.current;
          heroFrameRef.current.scrollTop = exactScrollTop.current;
          currentScrollTop = exactScrollTop.current;
        }

        // 3. VÒNG LẶP VÔ TẬN (SMOOTH INFINITE SCROLL)
        if (!isInteracting.current) {
          // Khi tự động trôi, luôn giữ vị trí ở "khối giữa" (listHeight đến 2*listHeight)
          if (currentScrollTop < listHeight) {
            exactScrollTop.current += listHeight;
            heroFrameRef.current.scrollTop = exactScrollTop.current;
            currentScrollTop = exactScrollTop.current;
          } else if (currentScrollTop >= listHeight * 2) {
            exactScrollTop.current -= listHeight;
            heroFrameRef.current.scrollTop = exactScrollTop.current;
          }
        } else {
          // Khi đang vuốt tay, cho phép vượt ra khỏi khối giữa, chỉ chặn lại ở mép tuyệt đối để KHÔNG làm ngắt quán tính (momentum) của trình duyệt
          if (currentScrollTop <= 0) {
            exactScrollTop.current += listHeight;
            heroFrameRef.current.scrollTop = exactScrollTop.current;
          } else if (currentScrollTop >= heroFrameRef.current.scrollHeight - heroFrameRef.current.clientHeight) {
            exactScrollTop.current -= listHeight;
            heroFrameRef.current.scrollTop = exactScrollTop.current;
          }
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDragging.current = true;
    isMoved.current = false;
    sliderRef.current.style.cursor = 'grabbing';
    sliderRef.current.style.scrollSnapType = 'none'; // Tắt snap khi đang kéo
    startY.current = e.pageY - sliderRef.current.offsetTop;
    scrollTop.current = sliderRef.current.scrollTop;
  };

  const handleMouseLeave = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
      sliderRef.current.style.scrollSnapType = 'y mandatory'; // Bật lại snap
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
      sliderRef.current.style.scrollSnapType = 'y mandatory';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    e.preventDefault();
    const y = e.pageY - sliderRef.current.offsetTop;
    const walk = (y - startY.current) * 1.5; // Tốc độ cuộn chuột
    if (Math.abs(walk) > 5) {
      isMoved.current = true;
    }
    sliderRef.current.scrollTop = scrollTop.current - walk;
  };

  return (
    <>
      <div className="hero-full-container">
      <div className="hero-slider-wrapper">

        <div 
<<<<<<< HEAD
          className="hero-frame"
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ cursor: 'grab' }}
        >
          {heroImages.map((img, index) => (
=======
          className="hero-frame" 
          ref={heroFrameRef}
          // Bắt các sự kiện tương tác vật lý từ người dùng
          onWheel={handleInteractEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleInteractEnd}
          onTouchCancel={handleInteractEnd} // Bắt sự kiện khi trình duyệt điện thoại ngắt cảm ứng
          onMouseLeave={handleInteractEnd}  // Bắt sự kiện khi chuột trượt ra khỏi khung banner
          onMouseDown={handleMouseDown}
          onDragStart={(e) => e.preventDefault()} // Ngăn trình duyệt kéo ảnh mặc định
          style={{ userSelect: 'none', cursor: 'grab' }} // Tránh bôi đen văn bản và tạo con trỏ bàn tay
        >
          {/* Nhân bản 3 lần mảng ảnh để tạo không gian đệm vuốt vô tận siêu mượt */}
          {[...heroImages, ...heroImages, ...heroImages].map((img, index) => (
>>>>>>> 2eef6a03590428a3b58b41b7b4a72495670e7b8d
            <div
              key={index}
              className="hero-slide"
              style={{
                backgroundImage: `url(${img})`,
<<<<<<< HEAD
                opacity: 1, // Ảnh nào cũng hiện để trượt qua
                pointerEvents: 'auto',
                zIndex: index === currentHeroSlide ? 2 : 1
              }}
              onClick={() => {
                if (!isMoved.current) {
                  onHeroClick(index);
                }
              }}
            />
          ))}

          {/* <div className="hero-dots">
            {heroImages.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrentHeroSlide(index)}
                className={`hero-dot ${index === currentHeroSlide ? 'active' : ''}`}
              />
            ))}
          </div> */}
        </div>

        {/* <button className="hero-nav-btn next" onClick={handleNextHero}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button> */}
      </div>

      {/* <div className="hero-bottom-action">
        <button 
          className="btn-dozo-about"
          onClick={() => {
            navigate('/about');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
=======
              }}
              // Trả về index chuẩn theo mảng gốc
              onClick={(e) => {
                // Tăng ngưỡng lên 10px và bắt cả vuốt X/Y để chống chạm nhầm siêu nhạy trên điện thoại
                if (dragDistance.current < 10) {
                  const heroIndex = index % heroImages.length;
                  navigate(`/hero/${heroIndex}`);
                } else {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
>>>>>>> 2eef6a03590428a3b58b41b7b4a72495670e7b8d
        >
          {/* =========================================
              HIỆU ỨNG LOGO CHẠY NGANG Ở LỀ DƯỚI
              ========================================= */}
          <div className="hero-running-overlay">
            <div className="hero-running-track">
              <div className="hero-running-item"><img src="/images/black_text_logo.png" alt="Future Studio Logo" /></div>
              <div className="hero-running-item"><img src="/images/black_text_logo.png" alt="Future Studio Logo" /></div>
            </div>
          </div>
        </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
};

export default HeroSlider;