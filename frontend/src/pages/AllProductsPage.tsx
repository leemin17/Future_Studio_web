import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { NewsItem, ProductCategory } from '@shared/types';
import QuickViewModal from '../components/QuickViewModal';
import Player from '@vimeo/player';
import { resolveMediaUrl } from '../utils/media';
import { sortByDateDesc } from '../utils/date';
import ProductAdminModal from '../components/ProductAdminModal';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  deleteDatabaseProduct,
  fetchDatabaseProducts,
} from '../services/products';

const getVimeoId = (url: string) => {
  const match = /vimeo.*\/(\d+)/i.exec(url);
  return match ? match[1] : null;
};

const getYouTubeId = (url: string) =>
  url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i)?.[1] ?? null;

const getYouTubeThumbnail = (url: string) => {
  const id = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i)?.[1];
  const thumbnailId = url.match(/img\.youtube\.com\/vi\/([A-Za-z0-9_-]{6,})\//i)?.[1];
  return id || thumbnailId ? `https://img.youtube.com/vi/${id ?? thumbnailId}/maxresdefault.jpg` : url;
};

interface ProductCardProps {
  item: NewsItem;
  onClick: () => void;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, onClick, canManage, onEdit, onDelete, deleting }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(() => getYouTubeThumbnail(item.imageUrl));

  useEffect(() => {
    setThumbnailUrl(getYouTubeThumbnail(item.imageUrl));
  }, [item.imageUrl]);

  const isVimeo = useMemo(() => item.videoUrl?.includes('vimeo'), [item.videoUrl]);
  const youtubeId = useMemo(() => item.videoUrl ? getYouTubeId(item.videoUrl) : null, [item.videoUrl]);
  const isYouTube = Boolean(youtubeId);

  useEffect(() => {
    if (isVimeo && item.videoUrl) {
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
  }, [isVimeo, item.videoUrl]);

  useEffect(() => {
    if (isVimeo && item.videoUrl && playerContainerRef.current) {
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
  }, [item.videoUrl, isVimeo]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (isVimeo && playerRef.current) {
      playerRef.current.play().catch(() => undefined);
    } else if (!isVimeo && !isYouTube && videoRef.current) {
      videoRef.current.play().catch(() => undefined);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (isVimeo && playerRef.current) {
      playerRef.current.pause();
      playerRef.current.setCurrentTime(0);
    } else if (!isVimeo && !isYouTube && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="news-card">
      <div className="news-image natural-size">
        {canManage && (
          <div className="product-card-admin-actions">
            <button type="button" onClick={(event) => { event.stopPropagation(); onEdit(); }} aria-label={`Edit ${item.title}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16-.8 4.8L8 20l10.6-10.6-4-4L4 16Z"/><path d="m13.8 6.2 4 4"/></svg>
              <span>Edit</span>
            </button>
            <button className="product-card-delete" type="button" disabled={deleting} onClick={(event) => { event.stopPropagation(); onDelete(); }} aria-label={`Delete ${item.title}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-9 0 1 14h10l1-14M10 11v6m4-6v6"/></svg>
              <span>{deleting ? 'Deleting' : 'Delete'}</span>
            </button>
          </div>
        )}
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
          onError={() => {
            const id = thumbnailUrl.match(/img\.youtube\.com\/vi\/([A-Za-z0-9_-]{6,})\//i)?.[1];
            if (id && thumbnailUrl.includes('maxresdefault')) {
              setThumbnailUrl(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
            }
          }}
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
            ) : isYouTube && youtubeId ? (
              isHovering ? (
                <iframe
                  className="youtube-hover-player"
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&rel=0&modestbranding=1&playsinline=1`}
                  title={`${item.title} preview`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  tabIndex={-1}
                />
              ) : null
            ) : (
              <video
                ref={videoRef}
                src={resolveMediaUrl(item.videoUrl)}
                muted
                loop
                playsInline
              />
            )}
          </div>
        )}

        <p className="news-text">{item.title} - {item.clientInformation}</p>
      </div>
    </div>
  );
};

interface AllProductsPageProps {
  category?: ProductCategory;
}

const AllProductsPage: React.FC<AllProductsPageProps> = ({ category }) => {
  const [selectedProduct, setSelectedProduct] = useState<NewsItem | null>(null);
  const [databaseProducts, setDatabaseProducts] = useState<NewsItem[]>([]);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<NewsItem | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const categoryFilter = category;

  const allProducts = useMemo(
    () => {
      const filteredDatabaseProducts = categoryFilter
        ? databaseProducts.filter((item) => item.category === categoryFilter)
        : databaseProducts;
      return sortByDateDesc(filteredDatabaseProducts);
    },
    [databaseProducts, categoryFilter],
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    void fetchDatabaseProducts()
      .then((items) => {
        if (active) {
          setDatabaseProducts(items);
        }
      })
      .catch((error) => console.warn('Unable to load database products:', error));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => setIsAdmin(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(Boolean(session));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const openCreate = () => {
    setEditingProduct(null);
    setIsAdminModalOpen(true);
  };

  const openEdit = (product: NewsItem) => {
    setEditingProduct(product);
    setSelectedProduct(null);
    setIsAdminModalOpen(true);
  };

  const handleDelete = async (product: NewsItem) => {
    if (!window.confirm(`Permanently delete "${product.title}"? This action cannot be undone and the product will disappear from all categories.`)) return;
    setDeletingId(product.id);
    try {
      await deleteDatabaseProduct(product.id);
      setDatabaseProducts((current) => current.filter((item) => item.id !== product.id));
      if (selectedProduct?.id === product.id) setSelectedProduct(null);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to delete this product.');
    } finally {
      setDeletingId(null);
    }
  };

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
        product={editingProduct}
        onClose={() => { setIsAdminModalOpen(false); setEditingProduct(null); }}
        onSaved={(savedProduct) => {
          setDatabaseProducts((current) => {
            const exists = current.some((item) => item.id === savedProduct.id);
            return exists ? current.map((item) => item.id === savedProduct.id ? savedProduct : item) : [savedProduct, ...current];
          });
        }}
      />

      <section className="all-products-section">
        <motion.div className="all-products-grid" layout>
          {allProducts.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onClick={() => handleProductClick(item)}
              canManage={isAdmin}
              onEdit={() => openEdit(item)}
              onDelete={() => void handleDelete(item)}
              deleting={deletingId === item.id}
            />
          ))}
          {isAdmin && (
            <motion.button
              type="button"
              onClick={openCreate}
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
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default AllProductsPage;
