import React, { useRef, useEffect } from 'react';
import { heroImages, newsData, type NewsItem } from '@data/database';

type HeroMediaItem = (typeof heroImages)[number] | string;

const getVimeoEmbedUrl = (src: string) => {
  const idMatch = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const videoId = idMatch?.[1] ?? src;

  return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1&autopause=0&title=0&byline=0&portrait=0`;
};

const getHeroMedia = (item: HeroMediaItem) => {
  if (typeof item === 'string') {
    return {
      type: 'image' as const,
      src: item,
      title: 'Future Studio hero image',
      poster: undefined,
      productId: 0,
    };
  }

  return item;
};

interface HeroSliderProps {
  onSelectProduct: (product: NewsItem) => void;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ onSelectProduct }) => {
  const heroFrameRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(() => window.matchMedia('(max-width: 768px)').matches);
  const isInteracting = useRef(false);
  const interactTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exactScrollTop = useRef(0);
  const scrollDirection = useRef(1);

  const isDragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const dragDistance = useRef(0);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const syncViewport = () => setIsMobile(mobileQuery.matches);

    syncViewport();
    mobileQuery.addEventListener('change', syncViewport);
    return () => mobileQuery.removeEventListener('change', syncViewport);
  }, []);

  const handleInteractStart = () => {
    isInteracting.current = true;
    if (interactTimeout.current) {
      clearTimeout(interactTimeout.current);
    }
  };

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

  const handleInteractEnd = () => {
    isDragging.current = false;
    if (interactTimeout.current) {
      clearTimeout(interactTimeout.current);
    }
    interactTimeout.current = setTimeout(() => {
      isInteracting.current = false;
    }, 50);
  };

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

  useEffect(() => {
    let animationFrameId: number;
    const scrollSpeed = 0.6;

    if (heroFrameRef.current) {
      heroFrameRef.current.scrollTop = 0;
      exactScrollTop.current = 0;
    }

    // Mobile uses the page scroll instead of the desktop's nested vertical reel.
    if (isMobile) {
      return () => {
        if (interactTimeout.current) clearTimeout(interactTimeout.current);
      };
    }

    const autoScroll = () => {
      if (heroFrameRef.current) {
        const listHeight = heroFrameRef.current.scrollHeight / 2;
        let currentScrollTop = heroFrameRef.current.scrollTop;
        const nativeDelta = currentScrollTop - exactScrollTop.current;

        if (Math.abs(nativeDelta) > 10) {
          isInteracting.current = true;

          if (nativeDelta > 0) {
            scrollDirection.current = 1;
          } else if (nativeDelta < 0) {
            scrollDirection.current = -1;
          }

          if (interactTimeout.current) clearTimeout(interactTimeout.current);
          interactTimeout.current = setTimeout(() => {
            isInteracting.current = false;
          }, 50);
        }

        if (isInteracting.current) {
          exactScrollTop.current = currentScrollTop;
          if (exactScrollTop.current < 0) exactScrollTop.current = 0;
        } else {
          exactScrollTop.current += scrollSpeed * scrollDirection.current;

          if (exactScrollTop.current <= 0) {
            exactScrollTop.current = 0;
            scrollDirection.current = 1;
          }

          heroFrameRef.current.scrollTop = exactScrollTop.current;
          currentScrollTop = exactScrollTop.current;
        }

        if (currentScrollTop >= listHeight) {
          exactScrollTop.current -= listHeight;
          heroFrameRef.current.scrollTop = exactScrollTop.current;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactTimeout.current) clearTimeout(interactTimeout.current);
    };
  }, [isMobile]);

  return (
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
          {[...heroImages, ...heroImages].map((item, index) => {
            const media = getHeroMedia(item);
            const isVimeo = media.type === 'vimeo';

            return (
              <div
                key={index}
                className={`hero-slide${isVimeo ? ' hero-slide--video' : ''}`}
                style={{
                  backgroundImage: media.poster ? `url(${media.poster})` : isVimeo ? undefined : `url(${media.src})`,
                }}
                onClick={(e) => {
                  if (dragDistance.current < 10) {
                    const product = newsData.find((item) => item.id === media.productId);
                    if (product) onSelectProduct(product);
                  } else {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                {isVimeo && (
                  <iframe
                    className="hero-slide-video"
                    src={getVimeoEmbedUrl(media.src)}
                    title={media.title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    loading="lazy"
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* <div className="hero-running-overlay">
                  <div className="hero-running-track">
                    <div className="hero-running-item"><img src="/images/LOGObitis.png" alt="bitis logo" /></div>
                    <div className="hero-running-item"><img src="/images/logofuturesymbol.png" alt="Future Studio Logo" /></div>
                    <div className="hero-running-item"><img src="/images/LOGObitis.png" alt="bitis logo" /></div>
                    <div className="hero-running-item"><img src="/images/logofuturesymbol.png" alt="Future Studio Logo" /></div>
                  </div>
                </div> */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
