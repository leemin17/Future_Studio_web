import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { newsData } from '@shared/fallbackData';
import type { NewsItem } from '@shared/types';
import QuickViewModal from '../components/QuickViewModal';
import Player from '@vimeo/player';
import { useInView } from 'react-intersection-observer';
import { getAssetUrl, resolveMediaUrl } from '../utils/media';
import { sortByDateDesc } from '../utils/date';
import ProductAdminModal from '../components/ProductAdminModal';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchDatabaseProducts } from '../services/products';

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
      fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(item.videoUrl)}&width=1920`)
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
  const [databaseProducts, setDatabaseProducts] = useState<NewsItem[]>([]);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const categoryFilter = products?.find((item) => item.category)?.category;

  const allProducts = useMemo(
    () => {
      const staticProducts = products ? [...products] : [...newsData];
      const filteredDatabaseProducts = categoryFilter
        ? databaseProducts.filter((item) => item.category === categoryFilter)
        : databaseProducts;
      const mergedProducts = new Map<number, NewsItem>();
      staticProducts.forEach((item) => mergedProducts.set(item.id, item));
      filteredDatabaseProducts.forEach((item) => mergedProducts.set(item.id, item));
      return sortByDateDesc([...mergedProducts.values()]);
    },
    [products, databaseProducts, categoryFilter],
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    void fetchDatabaseProducts()
      .then((items) => {
        if (active) setDatabaseProducts(items);
      })
      .catch((error) => console.warn('Unable to load database products:', error));
    return () => {
      active = false;
    };
  }, []);

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
      <ProductAdminModal
        open={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onCreated={(product) => setDatabaseProducts((current) => [product, ...current])}
      />

      <section className="all-products-section">
        <motion.div className="all-products-grid" layout>
          {allProducts.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onClick={() => handleProductClick(item)}
            />
          ))}
          <motion.button
            type="button"
            onClick={() => setIsAdminModalOpen(true)}
            className="product-end-cta"
            layout
            aria-label="Create a product"
            whileTap={{ scale: 0.985 }}
          >
            <span className="product-end-cta-plus" aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="product-end-cta-label">Create a project</span>
            <span className="product-end-cta-description">
              Bring your next idea to life with Future Studio.
            </span>
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

export default AllProductsPage;
