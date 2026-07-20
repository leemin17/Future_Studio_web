import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NewsItem, ProductCategory } from '@shared/types';
import QuickViewModal from '../components/QuickViewModal';
import Player from '@vimeo/player';
import { resolveMediaUrl } from '../utils/media';
import { sortByDateDesc } from '../utils/date';
import ProductAdminModal from '../components/ProductAdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { supabase } from '../lib/supabase';
import { deleteDatabaseProduct } from '../services/products';
import { productsQueryKey, useSupabaseProducts } from '../hooks/useSupabaseProducts';
import { getProjectIdFromSlug, getProjectPath } from '../utils/projectRoutes';
import { applySeoMetadata, getAbsoluteMediaUrl } from '../utils/seo';

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
          playerRef.current = null;
          void player.destroy().catch(() => undefined);
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
  const navigate = useNavigate();
  const location = useLocation();
  const { projectSlug } = useParams<{ projectSlug?: string }>();
  const [selectedProduct, setSelectedProduct] = useState<NewsItem | null>(null);
  const databaseProducts = useSupabaseProducts();
  const queryClient = useQueryClient();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<NewsItem | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<NewsItem | null>(null);
  const categoryFilter = category;
  const routeProductId = projectSlug ? getProjectIdFromSlug(projectSlug) : null;

  const allProducts = useMemo(
    () => {
      const filteredDatabaseProducts = categoryFilter
        ? databaseProducts.filter((item) => item.category === categoryFilter)
        : databaseProducts;
      return sortByDateDesc(filteredDatabaseProducts);
    },
    [databaseProducts, categoryFilter],
  );

  const deleteMutation = useMutation({
    mutationFn: deleteDatabaseProduct,
    onSuccess: (_result, deletedId) => {
      queryClient.setQueryData<NewsItem[]>(productsQueryKey, (current = []) => current.filter((item) => item.id !== deletedId));
      if (selectedProduct?.id === deletedId) setSelectedProduct(null);
    },
  });

  useEffect(() => {
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => setIsAdmin(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(Boolean(session));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (routeProductId === null) return;
    const routeProduct = databaseProducts.find((item) => item.id === routeProductId);
    if (routeProduct) setSelectedProduct(routeProduct);
  }, [databaseProducts, routeProductId]);

  useEffect(() => {
    if (!selectedProduct || !projectSlug) return;
    applySeoMetadata({
      title: `${selectedProduct.title} | Future Studio Vietnam`,
      description: selectedProduct.describe || `${selectedProduct.title} - dự án của Future Studio Vietnam dành cho ${selectedProduct.clientInformation}.`,
      path: getProjectPath(selectedProduct),
      image: getAbsoluteMediaUrl(selectedProduct.imageUrl),
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    });
  }, [projectSlug, selectedProduct]);

  const openCreate = () => {
    setEditingProduct(null);
    setIsAdminModalOpen(true);
  };

  const openEdit = (product: NewsItem) => {
    setEditingProduct(product);
    setSelectedProduct(null);
    setIsAdminModalOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to delete this product.');
    }
  };

  const handleProductClick = (item: NewsItem) => {
    setSelectedProduct(item);
    navigate(getProjectPath(item), { state: { quickViewFrom: location.pathname } });
  };

  const handleCloseQuickView = () => {
    setSelectedProduct(null);
    if (projectSlug) {
      const state = location.state as { quickViewFrom?: string } | null;
      navigate(state?.quickViewFrom || '/all-products', { replace: true });
    }
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
          queryClient.setQueryData<NewsItem[]>(productsQueryKey, (current = []) => {
            const exists = current.some((item) => item.id === savedProduct.id);
            return exists ? current.map((item) => item.id === savedProduct.id ? savedProduct : item) : [savedProduct, ...current];
          });
        }}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(nextOpen) => { if (!nextOpen) setPendingDelete(null); }}
        title="Delete this project?"
        description={`"${pendingDelete?.title ?? 'This project'}" will be permanently removed from every product category.`}
        confirmLabel="Delete permanently"
        danger
        busy={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
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
              onDelete={() => setPendingDelete(item)}
              deleting={deleteMutation.isPending && deleteMutation.variables === item.id}
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
