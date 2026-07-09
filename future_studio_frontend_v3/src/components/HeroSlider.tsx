import React, { useRef, useEffect } from 'react';
import { heroImages } from '../data/database';
import { useNavigate } from 'react-router-dom';

const HeroSlider: React.FC = () => {
  const navigate = useNavigate();
  const heroFrameRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false); 
  const interactTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exactScrollTop = useRef(0); 
  const scrollDirection = useRef(1); // 1: tự động trôi xuống, -1: tự động trôi lên

  const isDragging = useRef(false);
  const lastX = useRef(0); 
  const lastY = useRef(0); 
  const dragDistance = useRef(0);

  // Hàm khi người dùng giữ tay / giữ chuột
  const handleInteractStart = () => {
    isInteracting.current = true;
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
      heroFrameRef.current.style.cursor = 'grabbing';
    }
  };

  // Xử lý chạm trên màn hình cảm ứng
  const handleTouchStart = (e: React.TouchEvent) => {
    handleInteractStart();
    isDragging.current = true;
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
    interactTimeout.current = setTimeout(() => {
      isInteracting.current = false;
    }, 50);
  };

  // Lắng nghe sự kiện kéo chuột trên TOÀN BỘ WINDOW
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !heroFrameRef.current) return;
      const deltaX = e.clientX - lastX.current;
      const deltaY = e.clientY - lastY.current;
      dragDistance.current += Math.abs(deltaX) + Math.abs(deltaY);
      
      heroFrameRef.current.scrollTop -= deltaY;
      exactScrollTop.current = heroFrameRef.current.scrollTop;
      lastX.current = e.clientX;
      lastY.current = e.clientY;
    };

    const handleGlobalMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        if (heroFrameRef.current) {
          heroFrameRef.current.style.cursor = 'grab';
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
  }, []);

  // Vòng lặp Animation & Infinite Scroll
  useEffect(() => {
    let animationFrameId: number;
    const scrollSpeed = 0.6; 

    // Ép vị trí ban đầu nằm ở mốc 0 tuyệt đối (ảnh đầu tiên)
    if (heroFrameRef.current) {
      heroFrameRef.current.scrollTop = 0;
      exactScrollTop.current = 0;
    }

    const autoScroll = () => {
      if (heroFrameRef.current) {
        // CHIA 2: Vì ở dưới JSX ta chỉ còn 2 mảng ảnh
        const listHeight = heroFrameRef.current.scrollHeight / 2;
        let currentScrollTop = heroFrameRef.current.scrollTop;

        // 1. KIỂM TRA LỰC QUÁN TÍNH
        const nativeDelta = currentScrollTop - exactScrollTop.current;
          
        if (Math.abs(nativeDelta) > 10) {
          isInteracting.current = true; 
          
          if (nativeDelta > 0) {
            scrollDirection.current = 1; // Vuốt xuống
          } else if (nativeDelta < 0) {
            scrollDirection.current = -1; // Vuốt lên
          }
          
          if (interactTimeout.current) clearTimeout(interactTimeout.current);
          interactTimeout.current = setTimeout(() => {
            isInteracting.current = false;
          }, 50);
        }

        // 2. ĐỒNG BỘ VỊ TRÍ
        if (isInteracting.current) {
          exactScrollTop.current = currentScrollTop;
          // Chống lỗi bounce (nảy trang) trên iOS/Mac khi cố vuốt ngược lên quá mốc 0
          if (exactScrollTop.current < 0) exactScrollTop.current = 0;
        } else {
          exactScrollTop.current += scrollSpeed * scrollDirection.current;

          // CHẶN TRẦN TRÊN CÙNG
          if (exactScrollTop.current <= 0) {
            exactScrollTop.current = 0;
            scrollDirection.current = 1; // Đụng trần thì tự trôi xuống lại
          }

          heroFrameRef.current.scrollTop = exactScrollTop.current;
          currentScrollTop = exactScrollTop.current;
        }

        // 3. VÒNG LẶP VÔ TẬN (CHỈ XẢY RA KHI CUỘN XUỐNG DƯỚI)
        if (currentScrollTop >= listHeight) {
           exactScrollTop.current -= listHeight;
           heroFrameRef.current.scrollTop = exactScrollTop.current;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    // Dọn dẹp bộ nhớ khi component bị hủy
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactTimeout.current) clearTimeout(interactTimeout.current);
    };
  }, []);

  return (
    <>
      <div className="hero-full-container">
        <div className="hero-slider-wrapper">
          <div 
            className="hero-frame" 
            ref={heroFrameRef}
            onWheel={handleInteractEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleInteractEnd}
            onTouchCancel={handleInteractEnd} 
            onMouseLeave={handleInteractEnd}  
            onMouseDown={handleMouseDown}
            onDragStart={(e) => e.preventDefault()} 
            style={{ userSelect: 'none', cursor: 'grab' }} 
          >
            {/* NHÂN BẢN 2 LẦN: Mảng 1 làm mốc chặn trên, mảng 2 làm đệm lặp vô tận */}
            {[...heroImages, ...heroImages].map((img, index) => (
              <div
                key={index}
                className="hero-slide"
                style={{
                  backgroundImage: `url(${img})`,
                }}
                onClick={(e) => {
                  if (dragDistance.current < 10) {
                    const heroIndex = index % heroImages.length;
                    navigate(`/hero/${heroIndex}`);
                  } else {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                {/* HIỆU ỨNG LOGO CHẠY NGANG */}
                <div className="hero-running-overlay">
                  <div className="hero-running-track">
                    <div className="hero-running-item"><img src="/images/LOGObitis.png" alt="bitis logo" /></div>
                    <div className="hero-running-item"><img src="/images/logofuturesymbol.png" alt="Future Studio Logo" /></div>
                    <div className="hero-running-item"><img src="/images/LOGObitis.png" alt="bitis logo" /></div>
                    <div className="hero-running-item"><img src="/images/logofuturesymbol.png" alt="Future Studio Logo" /></div>
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