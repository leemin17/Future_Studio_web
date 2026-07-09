import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { type NewsItem } from '../data/database';
import {
  IoClose,
  IoFolderOutline,
  IoImageOutline,
  IoLinkOutline,
} from 'react-icons/io5';
import { getAssetUrl } from '../utils/media';

interface QuickViewModalProps {
  product: NewsItem | null;
  onClose: () => void;
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

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const hasVideo = Boolean(product?.videoUrl);
  const media = !product
    ? null
    : hasVideo
      ? product.videoUrl.includes('vimeo')
        ? (
          <div className="quick-view-vimeo-wrap">
            <iframe
              className="quick-view-vimeo-embed"
              src={`https://player.vimeo.com/video/${getVimeoId(product.videoUrl)}?autoplay=0&title=0&byline=0&portrait=0`}
              allow="autoplay; fullscreen; picture-in-picture"
              title={product.title}
            ></iframe>
          </div>
        )
        : (
          <video
            className="quick-view-video"
            src={getAssetUrl(product.videoUrl)}
            poster={getAssetUrl(product.imageUrl)}
            controls
            muted
            playsInline
          />
        )
      : (
        <img
          src={getAssetUrl(product.imageUrl)}
          alt={`${product.title} - ${product.clientInformation}`}
          className="quick-view-image"
        />
      );

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="quick-view-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div className="quick-view-modal" variants={modalVariants} onClick={(e) => e.stopPropagation()}>
            <div className="quick-view-main">
              <div className="quick-view-header">
                <h3 className="quick-view-header-title">{product.title}</h3>
                <button className="quick-view-close-btn" onClick={onClose} aria-label="Close">
                  <IoClose size={18} />
                </button>
              </div>

              <div className={`quick-view-media-full ${hasVideo ? 'quick-view-media-full--video' : 'quick-view-media-full--image'}`}>
                {media}
                {!hasVideo && (
                  <div className="quick-view-floating-actions">
                    <button type="button" className="quick-view-floating-pill">
                      <IoImageOutline size={15} />
                      More Like This
                    </button>
                    <button type="button" className="quick-view-floating-pill">
                      <IoFolderOutline size={15} />
                      Save
                    </button>
                    <button type="button" className="quick-view-floating-pill">
                      <IoLinkOutline size={15} />
                      Permalink
                    </button>
                  </div>
                )}
              </div>

              <div className="quick-view-detail">
                <p className="quick-view-date">{product.date}</p>
                <h2 className="quick-view-title">{product.title}</h2>
                <p className="quick-view-client">{product.clientInformation}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
