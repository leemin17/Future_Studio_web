import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { newsData, customerData, type NewsItem } from '../data/database';
import QuickViewModal from '../components/QuickViewModal';

// --- ĐỊNH NGHĨA HIỆU ỨNG SO LE (STAGGERED ANIMATION) ---
// 1. Định nghĩa cho khung lưới bọc ngoài
const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      // Hiệu ứng sẽ áp dụng lần lượt cho các "con" với khoảng trễ 0.1s
      staggerChildren: 0.1,
    },
  },
};

// 2. Định nghĩa cho từng sản phẩm bên trong
const gridItemVariants = {
  hidden: { y: 20, opacity: 0 }, // Bắt đầu từ dưới 20px và trong suốt
  show: { y: 0, opacity: 1 }, // Di chuyển về vị trí 0 và hiện ra
};

// =====================================================================
// COMPONENT CARD SẢN PHẨM (ĐÃ ĐƯỢC TÁCH RIÊNG)
// - Đóng gói toàn bộ giao diện và logic cho một thẻ sản phẩm.
// - Sử dụng useRef để tương tác trực tiếp với các phần tử DOM.
// =====================================================================
interface ProductCardProps {
  item: NewsItem;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, onClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (video) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Lỗi tự động phát video:", error);
        });
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0; // Tua video về đầu để lần hover sau chạy lại từ đầu
    }
  };

  return (
    <motion.div
      className="news-card"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer' }}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      variants={gridItemVariants}
      layout
    >
      <div className="news-image natural-size">
        {item.videoUrl ? (
          <>
            <video ref={videoRef} src={`${import.meta.env.BASE_URL}${item.videoUrl}`} poster={`${import.meta.env.BASE_URL}${item.imageUrl}`} muted loop playsInline />
            <div className="video-play-overlay">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5V19L19 12L8 5Z" fill="white"/>
              </svg>
            </div>
          </>
        ) : (
          <img src={`${import.meta.env.BASE_URL}${item.imageUrl}`} alt={`${item.project_name} - ${item.clientInformation}`} />
        )}
        <p className="news-text">{item.project_name} - {item.clientInformation}</p>
      </div>
    </motion.div>
  );
};

// =====================================================================
// COMPONENT TRANG CHÍNH
// - Giờ đây chỉ còn nhiệm vụ quản lý state và render ra lưới sản phẩm.
// =====================================================================
const AllProductsPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<NewsItem | null>(null);

  // Tối ưu hóa: Chỉ gộp và sắp xếp lại sản phẩm một lần bằng useMemo
  const allProducts = useMemo(() => 
    [...newsData, ...customerData].sort((a, b) => 
      new Date(b.date.replace(/\./g, '-')).getTime() - new Date(a.date.replace(/\./g, '-')).getTime()
    ), 
  []);

  const handleProductClick = (item: NewsItem) => {
    setSelectedProduct(item);
  };

  const handleCloseQuickView = () => {
    setSelectedProduct(null);
  };

  return (
    <>
      {/* --- QUICK VIEW MODAL --- */}
      {/* Component QuickViewModal sẽ chỉ render khi có một sản phẩm được chọn */}
      <QuickViewModal product={selectedProduct} onClose={handleCloseQuickView} />
    <section className="all-products-section">

      {/* Bọc lưới sản phẩm bằng motion.div và áp dụng hiệu ứng container */}
      <motion.div
        className="all-products-grid"
        variants={gridContainerVariants}
        initial="hidden"
        animate="show"
      >
        {allProducts.map((item) => (
          <ProductCard 
            key={item.id}
            item={item}
            onClick={() => handleProductClick(item)}
          />
        ))}
      </motion.div>
    </section>
    </>
  );
};

export default AllProductsPage;
