import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { type NewsItem } from '../data/database';
import { IoClose } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleViewDetails = () => {
    if (product) {
      // Bắt đầu hiệu ứng đóng modal
      onClose();
      // Chờ 200ms (bằng với thời gian của exit animation) rồi mới chuyển trang
      // để đảm bảo animation chạy xong, tránh bị giật.
      setTimeout(() => {
        navigate(`/product/${product.id}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                  <video src={`${import.meta.env.BASE_URL}${product.videoUrl}`} poster={`${import.meta.env.BASE_URL}${product.imageUrl}`} autoPlay muted loop playsInline />
                ) : (
                  <img src={`${import.meta.env.BASE_URL}${product.imageUrl}`} alt={product.title} />
                )}
              </div>
              <div className="quick-view-info">
                <p className="quick-view-date">{product.date}</p>
                <h2 className="quick-view-title">{product.title}</h2>
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