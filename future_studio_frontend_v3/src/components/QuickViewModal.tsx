import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { type NewsItem } from '../data/database';
import { IoClose } from "react-icons/io5";
import { getAssetUrl } from '../utils/media';
import { useAppNavigation } from '../hooks/useAppNavigation';

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
  hidden: { y: "-50%", opacity: 0, scale: 0.8 },
  visible: { y: "0", opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 25 } },
  // Sửa lại hiệu ứng exit: trượt lên trên để nhất quán với hiệu ứng mở
  exit: { y: "-50%", opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { goToProduct } = useAppNavigation();

  const handleViewDetails = () => {
    if (product) {
      // Bắt đầu hiệu ứng đóng modal
      onClose();
      // Chờ 200ms (bằng với thời gian của exit animation) rồi mới chuyển trang
      // để đảm bảo animation chạy xong, tránh bị giật.
      setTimeout(() => {
        goToProduct(product.id);
      }, 200);
    }
  };

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
          <motion.div
            className="quick-view-modal"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()} // Ngăn không cho bấm xuyên qua modal
          >
            <button className="quick-view-close" onClick={onClose}>
              <IoClose size={24} />
            </button>
            <div className="quick-view-content">
              <div className="quick-view-media">
                {product.videoUrl ? (
                  product.videoUrl.includes('vimeo') ? (
                    <div style={{
                        position: 'relative',
                        paddingBottom: '56.25%', // 16:9 aspect ratio
                        height: 0,
                        overflow: 'hidden',
                        width: '100%',
                        backgroundColor: '#000'
                    }}>
                      <iframe
                        className="quick-view-vimeo-embed"
                        src={`https://player.vimeo.com/video/${product.videoUrl.split('/').pop()}?autoplay=1&loop=1&autopause=0&muted=1&background=1`}
                        allow="autoplay; fullscreen; picture-in-picture"
                        title={product.title}
                      ></iframe>
                    </div>
                  ) : (
                    <video src={getAssetUrl(product.videoUrl)} poster={getAssetUrl(product.imageUrl)} controls muted autoPlay playsInline loop />
                  )
                ) : (
                  <img src={getAssetUrl(product.imageUrl)} alt={`${product.title} - ${product.clientInformation}`} />
                )}
              </div>
              <div className="quick-view-info">
                <p className="quick-view-date">{product.date}</p>
                <h2 className="quick-view-title">{product.title} - {product.clientInformation}</h2>
                <button className="btn-primary-black" onClick={handleViewDetails}>Xem chi tiết sản phẩm</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;