import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { newsData } from '@shared/fallbackData';
import type { NewsItem, ProductCategory } from '@shared/types';
import QuickViewModal from '../components/QuickViewModal';
import Player from '@vimeo/player';
import { useInView } from 'react-intersection-observer';
import { getAssetUrl, resolveMediaUrl } from '../utils/media';
import { sortByDateDesc } from '../utils/date';
import ProductAdminModal from '../components/ProductAdminModal';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { deleteDatabaseProduct, fetchDatabaseProducts } from '../services/products';

const getVimeoId = (url: string) => {
  const match = /vimeo.*\/(\d+)/i.exec(url);
  return match ? match[1] : null;
};

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
  category?: ProductCategory;
}

const AllProductsPage: React.FC<AllProductsPageProps> = ({ products, category }) => {
  const [selectedProduct, setSelectedProduct] = useState<NewsItem | null>(null);
  const [databaseProducts, setDatabaseProducts] = useState<NewsItem[]>([]);
  const [deletedProductIds, setDeletedProductIds] = useState<number[]>([]);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<NewsItem | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const categoryFilter = category ?? products?.find((item) => item.category)?.category;

  const allProducts = useMemo(
    () => {
      const staticProducts = products
        ? [...products]
        : categoryFilter
          ? newsData.filter((item) => item.category === categoryFilter)
          : [...newsData];
      const filteredDatabaseProducts = categoryFilter
        ? databaseProducts.filter((item) => item.category === categoryFilter)
        : databaseProducts;
      const mergedProducts = new Map<number, NewsItem>();
      staticProducts.forEach((item) => mergedProducts.set(item.id, item));
      filteredDatabaseProducts.forEach((item) => mergedProducts.set(item.id, item));
      return sortByDateDesc([...mergedProducts.values()].filter((item) => !deletedProductIds.includes(item.id)));
    },
    [products, databaseProducts, categoryFilter, deletedProductIds],
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
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setIsAdmin(Boolean(session)));
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
      setDeletedProductIds((current) => current.includes(product.id) ? current : [...current, product.id]);
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
          setDeletedProductIds((current) => current.filter((id) => id !== savedProduct.id));
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
        </motion.div>
      </section>
    </div>
  );
};

export default AllProductsPage;
