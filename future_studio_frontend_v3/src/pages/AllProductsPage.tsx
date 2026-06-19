import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { newsData, customerData, type NewsItem } from '../data/database';
import ScrollReveal from '../components/ScrollReveal';

const AllProductsPage: React.FC = () => {
  const navigate = useNavigate();

  // Gộp và sắp xếp tất cả sản phẩm
  const allProducts = [...newsData, ...customerData].sort((a, b) => {
    return new Date(b.date.replace(/\./g, '-')).getTime() - new Date(a.date.replace(/\./g, '-')).getTime();
  });

  const handleProductClick = (item: NewsItem) => {
    navigate(`/product/${item.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="container" style={{ paddingTop: '60px', paddingBottom: '100px' }}>
      <ScrollReveal className="section-header">
        <span className="section-subtitle">OUR FULL COLLECTION</span>
        <h2 className="section-title">All Products</h2>
        <p className="section-desc">Khám phá toàn bộ sản phẩm và các dự án đã thực hiện bởi Future Studio</p>
      </ScrollReveal>

      {/* Sử dụng class all-products-grid mới đã được định nghĩa trong CSS */}
      <div className="all-products-grid">
        {allProducts.map((item) => (
          <motion.div
            key={item.id}
            className="news-card"
            onClick={() => handleProductClick(item)}
            style={{ cursor: 'pointer' }}
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            // Thêm layout prop để Framer Motion tính toán vị trí chính xác
            layout
          >
            <div className="news-sidebar">
              <span className="vertical-date">{item.date}</span>
            </div>
            <div className="news-content">
              <div className="news-image">
                <img src={`${import.meta.env.BASE_URL}${item.imageUrl}`} alt={item.title} />
              </div>
              <p className="news-text">{item.title}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AllProductsPage;
