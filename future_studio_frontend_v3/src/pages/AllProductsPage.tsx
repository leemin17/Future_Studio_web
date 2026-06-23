import React from 'react';
import { useNavigate } from 'react-router-dom';
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

const AllProductsPage: React.FC = () => {
  // const navigate = useNavigate(); // Sẽ không dùng navigate nữa
  const [selectedProduct, setSelectedProduct] = React.useState<NewsItem | null>(null);

  // Gộp và sắp xếp tất cả sản phẩm
  const allProducts = [...newsData, ...customerData].sort((a, b) => {
    return new Date(b.date.replace(/\./g, '-')).getTime() - new Date(a.date.replace(/\./g, '-')).getTime();
  });

  // Khi bấm vào sản phẩm, sẽ set state để mở modal Quick View
  const handleProductClick = (item: NewsItem) => {
    setSelectedProduct(item);
  };

  const handleCloseQuickView = () => {
    setSelectedProduct(null);
  };

  // --- LOGIC CHẠY VIDEO KHI HOVER ---
  // Khi đưa chuột vào card
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = e.currentTarget.querySelector('video');
    if (video) {
      video.play();
    }
  };

  // Khi đưa chuột ra khỏi card
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = e.currentTarget.querySelector('video');
    if (video) {
      video.pause();
      video.currentTime = 0; // Tua video về đầu để lần hover sau chạy lại từ đầu
    }
  };

  return (
    <>
      {/* --- QUICK VIEW MODAL --- */}
      {/* Component QuickViewModal sẽ chỉ render khi có một sản phẩm được chọn */}
      <QuickViewModal product={selectedProduct} onClose={handleCloseQuickView} />
    <section style={{ paddingTop: '60px', paddingBottom: '100px' }}>

      {/* Bọc lưới sản phẩm bằng motion.div và áp dụng hiệu ứng container */}
      <motion.div
        className="all-products-grid"
        variants={gridContainerVariants}
        initial="hidden"
        animate="show"
      >
        {allProducts.map((item) => (
          <motion.div // Áp dụng hiệu ứng cho từng item
            key={item.id}
            className="news-card"
            onClick={() => handleProductClick(item)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: 'pointer' }}
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            // Thêm layout prop để Framer Motion tính toán vị trí chính xác
            variants={gridItemVariants} // Gán hiệu ứng đã định nghĩa
            layout
          >
            {/* Bỏ news-content và news-sidebar, đưa media lên cấp đầu */}
            <div className="news-image natural-size">
                {item.videoUrl ? (
                  <video
                    src={`${import.meta.env.BASE_URL}${item.videoUrl}`}
                    poster={`${import.meta.env.BASE_URL}${item.imageUrl}`}
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img src={`${import.meta.env.BASE_URL}${item.imageUrl}`} alt={item.title} />
                )}
            </div>
            <p className="news-text">{item.title}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
    </>
  );
};

export default AllProductsPage;
