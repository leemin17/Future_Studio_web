import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { NewsItem } from '@shared/types';
import { IoRefresh } from 'react-icons/io5';
import Player from '@vimeo/player';
import { getAssetUrl, resolveMediaUrl } from '../utils/media';

interface QuickViewModalProps {
  product: NewsItem | null;
  onClose: () => void;
  embedded?: boolean;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants: Variants = {
  hidden: { y: '40px', opacity: 0, scale: 0.98 },
  visible: {
    y: '0',
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    y: '20px',
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
};

const getVimeoId = (url: string): string => {
  const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  return match ? match[1] : '';
};

const getYouTubeId = (url: string): string => {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
  return match ? match[1] : '';
};

const isYouTubeUrl = (url: string): boolean => /(?:youtube\.com|youtu\.be)/i.test(url);
const isAudioUrl = (url: string): boolean => /\.(mp3|wav|ogg|m4a|aac|flac)(?:[?#].*)?$/i.test(url);
const isDirectVideoUrl = (url: string): boolean => /\.(mp4|webm|mov|m4v|ogv)(?:[?#].*)?$/i.test(url) || /^(blob:|data:video)/i.test(url);
const getGenericEmbedUrl = (url: string): string => {
  if (/drive\.google\.com/i.test(url)) {
    return url.replace(/\/view(?:\?.*)?$/i, '/preview').replace(/\/edit(?:\?.*)?$/i, '/preview');
  }
  return url;
};

type MediaType = 'image' | 'video' | 'text' | 'embed' | 'model';
type MediaItem = {
  kind: MediaType;
  url: string;
  content?: string;
  caption?: string;
  isVimeo?: boolean;
  isYouTube?: boolean;
};

type QuickLayoutBlock = {
  type: 'grid' | 'full' | 'text' | 'embed' | 'model';
  columns?: 1 | 2 | 3 | 4;
  items: MediaItem[];
};

const inferMediaKind = (url: string, kind?: MediaType): MediaType => {
  if (kind) return kind;
  return /\.(mp4|webm|mov|m4v)$/i.test(url) || url.includes('vimeo') || isYouTubeUrl(url) ? 'video' : 'image';
};

const toMediaItem = (url: string, kind?: MediaType, content?: string, caption?: string): MediaItem => {
  const normalizedKind = inferMediaKind(url, kind);
  return {
    kind: normalizedKind,
    url,
    content,
    caption,
    isVimeo: normalizedKind === 'video' && url.includes('vimeo'),
    isYouTube: normalizedKind === 'video' && isYouTubeUrl(url),
  };
};

const buildQuickMedia = (product: NewsItem | null): MediaItem[] => {
  if (!product) return [];

  const baseImage = product.imageUrl?.trim();
  const baseVideo = (product.videoUrl ?? '').trim();
  const imageGallery = ((product as { imageGallery?: string[] }).imageGallery ?? []);
  const videoGallery = ((product as { videoGallery?: string[] }).videoGallery ?? []);

  const media: MediaItem[] = [];
  if (baseVideo) {
    media.push(toMediaItem(baseVideo, 'video'));
  } else if (baseImage) {
    media.push(toMediaItem(baseImage, 'image'));
  }

  imageGallery.forEach((url) => {
    const normalized = String(url ?? '').trim();
    if (normalized) {
      media.push(toMediaItem(normalized, 'image'));
    }
  });

  videoGallery.forEach((url) => {
    const normalized = String(url ?? '').trim();
    if (normalized) {
      media.push(toMediaItem(normalized, 'video'));
    }
  });

  if (!media.length && baseImage) {
    media.push(toMediaItem(baseImage, 'image'));
  }

  return media;
};

const buildQuickLayout = (product: NewsItem | null, mediaItems: MediaItem[]): QuickLayoutBlock[] => {
  const customLayout = product?.quickViewLayout ?? [];

  if (customLayout.length) {
    return customLayout
      .map((block) => ({
        type: block.type,
        columns: block.columns,
        items: block.items
          .map((item) => {
            const normalized = String(item.url ?? '').trim();
            const content = String(item.content ?? '').trim();
            return normalized || content ? toMediaItem(normalized, item.kind, content, item.caption) : null;
          })
          .filter((item): item is MediaItem => Boolean(item)),
      }))
      .filter((block) => block.items.length);
  }

  return [{ type: 'grid', columns: 2, items: mediaItems }];
};

interface QuickViewVideoProps {
  item: MediaItem;
  product: NewsItem | null;
}

const QuickViewVideo: React.FC<QuickViewVideoProps> = ({ item, product }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const vimeoIframeRef = useRef<HTMLIFrameElement>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    setHasEnded(false);

    if (!item.isVimeo || !vimeoIframeRef.current) return;

    const player = new Player(vimeoIframeRef.current);
    vimeoPlayerRef.current = player;

    const handleEnded = () => setHasEnded(true);
    const handlePlay = () => setHasEnded(false);

    player.on('ended', handleEnded);
    player.on('play', handlePlay);

    return () => {
      player.off('ended', handleEnded);
      player.off('play', handlePlay);
      vimeoPlayerRef.current = null;
    };
  }, [item.isVimeo, item.url]);

  const handleReplay = () => {
    setHasEnded(false);

    if (item.isVimeo) {
      vimeoPlayerRef.current?.setCurrentTime(0).then(() => {
        vimeoPlayerRef.current?.play().catch(() => undefined);
      });
      return;
    }

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => undefined);
    }
  };

  return (
    <div className="quick-view-video-shell">
      {item.isVimeo ? (
        <div className="quick-view-vimeo-wrap">
          <iframe
            ref={vimeoIframeRef}
            className="quick-view-vimeo-embed"
            src={`https://player.vimeo.com/video/${getVimeoId(item.url)}?autoplay=0&loop=1&title=0&byline=0&portrait=0&badge=0&pip=0&dnt=1`}
            allow="autoplay; fullscreen; picture-in-picture"
            title={product?.title}
          ></iframe>
        </div>
      ) : item.isYouTube ? (
        <div className="quick-view-vimeo-wrap">
          <iframe
            className="quick-view-vimeo-embed"
            src={`https://www.youtube.com/embed/${getYouTubeId(item.url)}?rel=0&modestbranding=1&playsinline=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={product?.title}
          ></iframe>
        </div>
      ) : isAudioUrl(item.url) ? (
        <div className="quick-view-audio-wrap">
          <audio className="quick-view-audio" src={resolveMediaUrl(item.url)} controls onEnded={() => setHasEnded(true)} onPlay={() => setHasEnded(false)} />
        </div>
      ) : isDirectVideoUrl(item.url) || !/^https?:\/\//i.test(item.url) ? (
        <video
          ref={videoRef}
          className="quick-view-video"
          src={resolveMediaUrl(item.url)}
          poster={product?.imageUrl ? resolveMediaUrl(product.imageUrl) : ''}
          controls
          muted
          playsInline
          onEnded={() => setHasEnded(true)}
          onPlay={() => setHasEnded(false)}
        />
      ) : (
        <div className="quick-view-vimeo-wrap">
          <iframe
            className="quick-view-vimeo-embed"
            src={getGenericEmbedUrl(item.url)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            title={product?.title}
          />
        </div>
      )}

      {hasEnded && (
        <div className="quick-view-replay-overlay">
          <button type="button" className="quick-view-replay-btn" onClick={handleReplay}>
            <IoRefresh size={18} />
            Xem lại
          </button>
        </div>
      )}
    </div>
  );
};

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, embedded = false }) => {
  const mediaItems = useMemo(() => buildQuickMedia(product), [product]);
  const mediaLayout = useMemo(() => buildQuickLayout(product, mediaItems), [product, mediaItems]);
  const hasCustomLayout = Boolean(product?.quickViewLayout?.length);
  const hasVideo = mediaLayout.some((block) => block.items.some((item) => item.kind === 'video'));

  const renderMedia = (item: MediaItem | undefined) => {
    if (!item) return null;

    if (item.kind === 'image') {
      return (
        <figure className="quick-view-content-figure">
          <img src={resolveMediaUrl(item.url)} alt={`${product?.title} - ${product?.clientInformation}`} className="quick-view-image" />
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>
      );
    }
    if (item.kind === 'video') {
      return <figure className="quick-view-content-figure"><QuickViewVideo item={item} product={product} />{item.caption && <figcaption>{item.caption}</figcaption>}</figure>;
    }
    if (item.kind === 'text') return <div className="quick-view-text-block">{item.content}</div>;
    return <iframe className="quick-view-embed-block" src={item.url} title={`${item.kind} - ${product?.title}`} loading="lazy" allow="autoplay; fullscreen; picture-in-picture; xr-spatial-tracking" allowFullScreen />;
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className={`quick-view-backdrop ${embedded ? 'quick-view-backdrop--embedded' : ''}`}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={embedded ? undefined : onClose}
        >
          <motion.div className={`quick-view-modal ${embedded ? 'quick-view-modal--embedded' : ''}`} variants={modalVariants} onClick={(e) => e.stopPropagation()}>
            <div className="quick-view-main">
              <div className="quick-view-header">
                <div className="quick-view-header-brand">
                  <img
                    className="quick-view-header-logo"
                    src={product.partnerLogoUrl ? resolveMediaUrl(product.partnerLogoUrl) : getAssetUrl('images/logo.jpg')}
                    alt={`${product.clientInformation} logo`}
                  />
                <div className="quick-view-header-copy">
                  <h3 className="quick-view-header-title">{product.title}</h3>
                  <span className="quick-view-header-client">{product.clientInformation}</span>
                </div>
                </div>
              </div>

              <div className={`quick-view-media-full ${hasVideo ? 'quick-view-media-full--video' : 'quick-view-media-full--image'}`}>
                {mediaLayout.map((block, blockIndex) => (
                  <div
                    key={`${block.type}-${blockIndex}`}
                    className={`quick-view-media-stack quick-view-media-stack--${block.type} quick-view-media-stack--cols-${block.columns ?? 1}`}
                  >
                    {block.items.map((item, index) => {
                      const isFeatured = block.type === 'full' || (!hasCustomLayout && blockIndex === 0 && index === 0);

                      return (
                        <div
                          key={`${item.kind}-${item.url || item.content}-${index}`}
                          className={`quick-view-media-card quick-view-media-card--${item.kind} ${isFeatured ? 'quick-view-media-card--featured' : ''}`}
                        >
                          {renderMedia(item)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* <div className="quick-view-detail">
                <p className="quick-view-date">{product.date}</p>
                <h2 className="quick-view-title">{product.title}</h2>
                <p className="quick-view-client">{product.clientInformation}</p>
                {description && <p className="quick-view-description">{description}</p>}
              </div> */}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
