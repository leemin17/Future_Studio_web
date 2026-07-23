import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { contactLinks as fallbackContactLinks } from '@shared/fallbackData';
import type { ContactLink, NewsItem, QuickViewTextStyle } from '@shared/types';
import DOMPurify from 'dompurify';
import { IoRefresh } from 'react-icons/io5';
import Player from '@vimeo/player';
import { getAssetUrl, resolveMediaUrl } from '../utils/media';
import { useSiteContent } from '../hooks/useSiteContent';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';
import { getProjectPath } from '../utils/projectRoutes';
import RichTextBlockEditor from './RichTextBlockEditor';

interface QuickViewModalProps {
  product: NewsItem | null;
  onClose: () => void;
  embedded?: boolean;
  onEmbeddedTextChange?: (textIndex: number, value: string, html: string) => void;
  onEmbeddedTextRemove?: (textIndex: number) => void;
  onEmbeddedTextStyleChange?: (textIndex: number, textStyle: QuickViewTextStyle) => void;
  onEmbeddedBlockMove?: (blockIndex: number, direction: -1 | 1) => void;
  onEmbeddedBlockRemove?: (blockIndex: number) => void;
  onEmbeddedGridColumnsChange?: (blockIndex: number, columns: 1 | 2 | 3 | 4) => void;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
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
const isDefaultProjectThumbnail = (url: string): boolean => !url || /(?:^|\/)(?:logo|logo_text)\.(?:jpe?g|png|webp)(?:[?#].*)?$/i.test(url);
const getGenericEmbedUrl = (url: string): string => {
  if (/drive\.google\.com/i.test(url)) {
    return url.replace(/\/view(?:\?.*)?$/i, '/preview').replace(/\/edit(?:\?.*)?$/i, '/preview');
  }
  return url;
};

const QuickViewNextThumbnail: React.FC<{ product: NewsItem }> = ({ product }) => {
  const videoUrl = product.videoUrl?.trim() ?? '';
  const youtubeId = getYouTubeId(videoUrl);
  const thumbnailKey = `${product.imageUrl}\n${videoUrl}`;
  const defaultThumbnail = (
    isDefaultProjectThumbnail(product.imageUrl) && youtubeId
      ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
      : product.imageUrl
  );
  const [thumbnailOverride, setThumbnailOverride] = useState<{ key: string; value: string } | null>(null);
  const thumbnail = thumbnailOverride?.key === thumbnailKey ? thumbnailOverride.value : defaultThumbnail;

  useEffect(() => {
    if (!isDefaultProjectThumbnail(product.imageUrl) || youtubeId || !videoUrl.includes('vimeo')) return;

    let active = true;
    fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}&width=1280`)
      .then((response) => response.json())
      .then((data: { thumbnail_url?: string }) => {
        if (active && data.thumbnail_url) setThumbnailOverride({ key: thumbnailKey, value: data.thumbnail_url });
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [product.imageUrl, thumbnailKey, videoUrl, youtubeId]);

  return (
    <img
      src={resolveMediaUrl(thumbnail)}
      alt={`${product.title} preview`}
      onError={() => {
        if (youtubeId && thumbnail.includes('maxresdefault')) {
          setThumbnailOverride({ key: thumbnailKey, value: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` });
        }
      }}
    />
  );
};

type MediaType = 'image' | 'video' | 'text' | 'embed' | 'model';
type MediaItem = {
  kind: MediaType;
  url: string;
  content?: string;
  html?: string;
  caption?: string;
  isVimeo?: boolean;
  isYouTube?: boolean;
  textStyle?: QuickViewTextStyle;
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

const toMediaItem = (url: string, kind?: MediaType, content?: string, caption?: string, textStyle?: QuickViewTextStyle, html?: string): MediaItem => {
  const normalizedKind = inferMediaKind(url, kind);
  return {
    kind: normalizedKind,
    url,
    content,
    caption,
    isVimeo: normalizedKind === 'video' && url.includes('vimeo'),
    isYouTube: normalizedKind === 'video' && isYouTubeUrl(url),
    textStyle,
    html,
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

const buildQuickLayout = (product: NewsItem | null, mediaItems: MediaItem[], keepEmptyText = false): QuickLayoutBlock[] => {
  const customLayout = product?.quickViewLayout ?? [];

  if (customLayout.length) {
    return customLayout
      .map((block) => ({
        type: block.type,
        columns: block.columns,
        items: block.items
          .map((item) => {
            const normalized = String(item.url ?? '').trim();
            const rawContent = String(item.content ?? '');
            const content = keepEmptyText && item.kind === 'text' ? rawContent : rawContent.trim();
            return normalized || content || (keepEmptyText && item.kind === 'text')
              ? toMediaItem(normalized, item.kind, content, item.caption, item.textStyle, item.html)
              : null;
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

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, embedded = false, onEmbeddedTextChange, onEmbeddedTextRemove, onEmbeddedTextStyleChange, onEmbeddedBlockMove, onEmbeddedBlockRemove, onEmbeddedGridColumnsChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const backdropRef = useRef<HTMLDivElement>(null);
  const products = useSupabaseProducts();
  const contactLinks = useSiteContent<ContactLink[]>('contact_links', fallbackContactLinks);
  const productId = product?.id ?? null;
  const [recommendationState, setRecommendationState] = useState({ productId, offset: 0 });
  const recommendationOffset = recommendationState.productId === productId ? recommendationState.offset : 0;
  const mediaItems = useMemo(() => buildQuickMedia(product), [product]);
  const mediaLayout = useMemo(() => buildQuickLayout(product, mediaItems, embedded), [embedded, product, mediaItems]);
  const hasCustomLayout = Boolean(product?.quickViewLayout?.length);
  const hasVideo = mediaLayout.some((block) => block.items.some((item) => item.kind === 'video'));
  const recommendedProducts = useMemo(() => {
    if (!product || products.length < 2) return [];
    const currentIndex = products.findIndex((item) => item.id === product.id);
    const startIndex = currentIndex >= 0 ? currentIndex : products.length - 1;
    return Array.from({ length: products.length - 1 }, (_, offset) => (
      products[(startIndex + offset + 1) % products.length]
    )).filter((item): item is NewsItem => Boolean(item) && item.id !== product.id);
  }, [product, products]);
  const nextProducts = useMemo(() => {
    if (!recommendedProducts.length) return [];
    return Array.from({ length: Math.min(3, recommendedProducts.length) }, (_, index) => (
      recommendedProducts[(recommendationOffset + index) % recommendedProducts.length]
    ));
  }, [recommendationOffset, recommendedProducts]);
  const footerLinks = useMemo(
    () => contactLinks.filter((item) => ['instagram', 'facebook', 'gmail'].includes(item.icon)),
    [contactLinks],
  );

  const openNextProject = (nextProduct: NewsItem) => {
    navigate(getProjectPath(nextProduct), { replace: true, state: location.state });
    backdropRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const moveRecommendations = (direction: -1 | 1) => {
    setRecommendationState((current) => {
      const count = recommendedProducts.length;
      const currentOffset = current.productId === productId ? current.offset : 0;
      return {
        productId,
        offset: count ? (currentOffset + direction + count) % count : 0,
      };
    });
  };

  const renderMedia = (item: MediaItem | undefined, textIndex = 0) => {
    if (!item) return null;

    if (item.kind === 'image') {
      return (
        <figure className="quick-view-content-figure">
          <img src={resolveMediaUrl(item.url)} alt={`${product?.title} - ${product?.brand.name}`} className="quick-view-image" />
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>
      );
    }
    if (item.kind === 'video') {
      return <figure className="quick-view-content-figure"><QuickViewVideo key={item.url} item={item} product={product} />{item.caption && <figcaption>{item.caption}</figcaption>}</figure>;
    }
    if (item.kind === 'text') {
      const textStyle: Required<QuickViewTextStyle> = {
        fontFamily: item.textStyle?.fontFamily ?? 'inherit',
        fontSize: item.textStyle?.fontSize ?? 30,
        fontWeight: item.textStyle?.fontWeight ?? 600,
        fontStyle: item.textStyle?.fontStyle ?? 'normal',
        textDecoration: item.textStyle?.textDecoration ?? 'none',
        textAlign: item.textStyle?.textAlign ?? 'left',
        color: item.textStyle?.color ?? '#f5f5f2',
        backgroundColor: item.textStyle?.backgroundColor ?? '#0b0b0c',
        width: item.textStyle?.width ?? 100,
      };
      const textBoxStyle = {
        width: `${textStyle.width}%`,
        backgroundColor: textStyle.backgroundColor,
      };
      const editableTextStyle = {
        color: textStyle.color,
        backgroundColor: textStyle.backgroundColor,
        fontFamily: textStyle.fontFamily,
        fontSize: `${textStyle.fontSize}px`,
        fontWeight: textStyle.fontWeight,
        fontStyle: textStyle.fontStyle,
        textDecoration: textStyle.textDecoration,
        textAlign: textStyle.textAlign,
      } as const;
      if (embedded && onEmbeddedTextChange) {
        return <RichTextBlockEditor html={item.html} content={item.content ?? ''} textStyle={item.textStyle ?? {}} onChange={(content, html) => onEmbeddedTextChange(textIndex, content, html)} onStyleChange={(textStyle) => onEmbeddedTextStyleChange?.(textIndex, textStyle)} onRemove={() => onEmbeddedTextRemove?.(textIndex)} />;
      }
      return <div className="quick-view-text-editor-shell quick-view-text-editor-shell--published" style={textBoxStyle}><div className="quick-view-text-block quick-view-rich-text-published" style={editableTextStyle} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.html || `<p>${item.content ?? ''}</p>`) }} /></div>;
    }
    return <iframe className="quick-view-embed-block" src={item.url} title={`${item.kind} - ${product?.title}`} loading="lazy" allow="autoplay; fullscreen; picture-in-picture; xr-spatial-tracking" allowFullScreen />;
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          ref={backdropRef}
          className={`quick-view-backdrop ${embedded ? 'quick-view-backdrop--embedded' : ''}`}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={embedded ? undefined : onClose}
        >
          <motion.div className={`quick-view-modal ${embedded ? 'quick-view-modal--embedded' : ''}`} variants={modalVariants} onClick={(e) => e.stopPropagation()}>
            <div className="quick-view-main">
              <div className="quick-view-project-content">
              <div className="quick-view-header">
                <div className="quick-view-header-brand">
                  <img
                    className="quick-view-header-logo"
                    src={product.brand.logoUrl ? resolveMediaUrl(product.brand.logoUrl) : getAssetUrl('images/logo.jpg')}
                    alt={`${product.brand.name} logo`}
                  />
                <div className="quick-view-header-copy">
                  <h3 className="quick-view-header-title">{product.title}</h3>
                  <span className="quick-view-header-client">{product.brand.name}</span>
                </div>
                </div>
              </div>

              <div className={`quick-view-media-full ${hasVideo ? 'quick-view-media-full--video' : 'quick-view-media-full--image'}`}>
                {mediaLayout.map((block, blockIndex) => (
                  <div
                    key={`${block.type}-${blockIndex}`}
                    className={`quick-view-media-stack quick-view-media-stack--${block.type} quick-view-media-stack--cols-${block.columns ?? 1}`}
                  >
                    {embedded && block.type !== 'text' && onEmbeddedBlockRemove && (
                      <div className="quick-view-block-controls">
                        <span>Block {String(blockIndex + 1).padStart(2, '0')}</span>
                        {block.type === 'grid' && onEmbeddedGridColumnsChange && (
                          <label>Columns<select value={block.columns ?? 1} onChange={(event) => onEmbeddedGridColumnsChange(blockIndex, Number(event.target.value) as 1 | 2 | 3 | 4)}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label>
                        )}
                        {onEmbeddedBlockMove && <button type="button" onClick={() => onEmbeddedBlockMove(blockIndex, -1)} disabled={blockIndex === 0} aria-label="Move block up">Up</button>}
                        {onEmbeddedBlockMove && <button type="button" onClick={() => onEmbeddedBlockMove(blockIndex, 1)} disabled={blockIndex === mediaLayout.length - 1} aria-label="Move block down">Down</button>}
                        <button type="button" className="quick-view-block-delete" onClick={() => onEmbeddedBlockRemove(blockIndex)}>Delete</button>
                      </div>
                    )}
                    {block.items.map((item, index) => {
                      const isFeatured = block.type === 'full' || (!hasCustomLayout && blockIndex === 0 && index === 0);

                      return (
                        <div
                          key={`${blockIndex}-${item.kind}-${index}`}
                          className={`quick-view-media-card quick-view-media-card--${item.kind} ${isFeatured ? 'quick-view-media-card--featured' : ''}`}
                        >
                          {renderMedia(item, mediaLayout.slice(0, blockIndex).filter((layoutBlock) => layoutBlock.type === 'text').length + index)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              </div>

              {!embedded && (
                <footer className="quick-view-footer">
                  {nextProducts.length > 0 && (
                    <div className="quick-view-next-section">
                      {recommendedProducts.length > 3 && <button type="button" className="quick-view-next-arrow quick-view-next-arrow--left" onClick={() => moveRecommendations(-1)} aria-label="Previous projects"><img src={getAssetUrl('icon/arrow.png')} alt="" aria-hidden="true" /></button>}
                      <div className="quick-view-next-grid">
                        {nextProducts.map((nextProduct) => (
                          <button key={nextProduct.id} type="button" className="quick-view-next-project" onClick={() => openNextProject(nextProduct)}>
                            <span className="quick-view-next-media">
                              <QuickViewNextThumbnail product={nextProduct} />
                            </span>
                            <span className="quick-view-next-copy">
                              <small>Next project</small>
                              <strong>{nextProduct.title}</strong>
                              <span>{nextProduct.brand.name} <i aria-hidden="true">&#8599;</i></span>
                            </span>
                          </button>
                        ))}
                      </div>
                      {recommendedProducts.length > 3 && <button type="button" className="quick-view-next-arrow quick-view-next-arrow--right" onClick={() => moveRecommendations(1)} aria-label="Next projects"><img src={getAssetUrl('icon/next.png')} alt="" aria-hidden="true" /></button>}
                    </div>
                  )}

                  <div className="quick-view-footer-bottom">
                    <span>&copy; {new Date().getFullYear()} Future Studio</span>
                    <nav aria-label="Future Studio social links">
                      {footerLinks.map((item) => (
                        <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{item.label}</a>
                      ))}
                    </nav>
                    <button type="button" onClick={() => backdropRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top <span aria-hidden="true">&#8593;</span></button>
                  </div>
                </footer>
              )}

              {/* <div className="quick-view-detail">
                <p className="quick-view-date">{product.date}</p>
                <h2 className="quick-view-title">{product.title}</h2>
                <p className="quick-view-client">{product.brand.name}</p>
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
