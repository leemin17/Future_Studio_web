import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { newsData, customerData, type NewsItem } from '@data/database';
import QuickViewModal from '../components/QuickViewModal';
import Player from '@vimeo/player';
import { useInView } from 'react-intersection-observer';
import { getAssetUrl, resolveMediaUrl } from '../utils/media';
import { sortByDateDesc } from '../utils/date';

const getVimeoId = (url: string) => {
  const match = /vimeo.*\/(\d+)/i.exec(url);
  return match ? match[1] : null;
};

interface ProductCardProps {
  item: NewsItem;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, onClick }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(item.imageUrl);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const isVimeo = useMemo(() => item.videoUrl?.includes('vimeo'), [item.videoUrl]);

  useEffect(() => {
    if (inView && isVimeo && item.videoUrl) {
      fetch(`https://vimeo.com/api/oembed.json?url=${item.videoUrl}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.thumbnail_url) {
            setThumbnailUrl(data.thumbnail_url);
          }
        })
        .catch(() => {
          // fallback to local placeholder
        });
    }
  }, [inView, isVimeo, item.videoUrl]);

  useEffect(() => {
    if (inView && isVimeo && item.videoUrl && playerContainerRef.current) {
      const videoId = getVimeoId(item.videoUrl);
      if (videoId) {
        const player = new Player(playerContainerRef.current, {
          id: parseInt(videoId, 10),
          muted: true,
          loop: true,
          controls: false,
          responsive: true,
        });
        playerRef.current = player;

        return () => {
          player.destroy();
        };
      }
    }
  }, [inView, item.videoUrl, isVimeo]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (isVimeo && playerRef.current) {
      playerRef.current.play().catch(() => undefined);
    } else if (!isVimeo && videoRef.current) {
      videoRef.current.play().catch(() => undefined);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (isVimeo && playerRef.current) {
      playerRef.current.pause();
      playerRef.current.setCurrentTime(0);
    } else if (!isVimeo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      ref={ref}
      className="news-card"
      layout
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 120, damping: 10 }}
    >
      <div className="news-image natural-size">
        <div
          className="interaction-overlay"
          onClick={onClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="button"
          aria-label={`Xem nhanh ${item.title}`}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onClick();
            }
          }}
        />

        <img
          src={resolveMediaUrl(thumbnailUrl)}
          alt={`${item.title} - ${item.clientInformation}`}
          loading="lazy"
        />

        {item.videoUrl && (
          <div
            className="media-preview-layer"
            style={{
              opacity: isHovering ? 1 : 0,
            }}
          >
            {isVimeo ? (
              <div ref={playerContainerRef} className="vimeo-player-container" />
            ) : (
              <video
                ref={videoRef}
                src={getAssetUrl(item.videoUrl)}
                muted
                loop
                playsInline
              />
            )}
          </div>
        )}

        <p className="news-text">{item.title} - {item.clientInformation}</p>
      </div>
    </motion.div>
  );
};

interface AllProductsPageProps {
  products?: NewsItem[];
}

const AllProductsPage: React.FC<AllProductsPageProps> = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState<NewsItem | null>(null);

  const allProducts = useMemo(
    () => sortByDateDesc(products ? [...products] : [...newsData, ...customerData]),
    [products],
  );

  const handleProductClick = (item: NewsItem) => {
    setSelectedProduct(item);
  };

  const handleCloseQuickView = () => {
    setSelectedProduct(null);
  };

  const isQuickViewOpen = Boolean(selectedProduct);

  useEffect(() => {
    document.body.style.overflow = isQuickViewOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isQuickViewOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isQuickViewOpen) {
        handleCloseQuickView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isQuickViewOpen]);

  return (
    <div className={`all-products-page ${isQuickViewOpen ? 'all-products-page--modal-open' : ''}`}>
      <QuickViewModal product={selectedProduct} onClose={handleCloseQuickView} />

      <section className="all-products-section">
        <motion.div className="all-products-grid" layout>
          {allProducts.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onClick={() => handleProductClick(item)}
            />
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default AllProductsPage;
