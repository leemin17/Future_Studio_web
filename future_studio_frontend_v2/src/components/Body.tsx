import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { newsData, customerData, type NewsItem } from '../data/database';
import ScrollReveal from './ScrollReveal';

interface BodyProps {
  onSelectProduct: (item: NewsItem) => void;
}

const Body: React.FC<BodyProps> = ({ onSelectProduct }) => {
  // LOGIC PHÂN TRANG: ALL PRODUCTS
  const [currentNewsPage, setCurrentNewsPage] = useState(1);
  const itemsPerPage = 5;
  const [hoveredNewsIndex, setHoveredNewsIndex] = useState<number | null>(null);

  // Sắp xếp bài viết theo ngày mới nhất (đổi định dạng yyyy.mm.dd thành yyyy-mm-dd)
  const sortedNewsData = [...newsData].sort((a, b) => {
    return new Date(b.date.replace(/\./g, '-')).getTime() - new Date(a.date.replace(/\./g, '-')).getTime();
  });

  const totalNewsPages = Math.ceil(sortedNewsData.length / itemsPerPage);
  const currentNews = sortedNewsData.slice((currentNewsPage - 1) * itemsPerPage, currentNewsPage * itemsPerPage);

  const handlePrevNews = () => { if (currentNewsPage > 1) setCurrentNewsPage(currentNewsPage - 1); };
  const handleNextNews = () => { if (currentNewsPage < totalNewsPages) setCurrentNewsPage(currentNewsPage + 1); };

  const formattedCurrentPage = String(currentNewsPage).padStart(2, '0');
  const formattedTotalPages = String(totalNewsPages).padStart(2, '0');

  // LOGIC PHÂN TRANG: OUR CUSTOMERS
  const [currentCustomerPage, setCurrentCustomerPage] = useState(1);
  const customersPerPage = 5;
  const [hoveredCustomerIndex, setHoveredCustomerIndex] = useState<number | null>(null);

  const sortedCustomerData = [...customerData].sort((a, b) => {
    return new Date(b.date.replace(/\./g, '-')).getTime() - new Date(a.date.replace(/\./g, '-')).getTime();
  });
  const totalCustomerPages = Math.ceil(sortedCustomerData.length / customersPerPage);
  const currentCustomers = sortedCustomerData.slice((currentCustomerPage - 1) * customersPerPage, currentCustomerPage * customersPerPage);

  const handlePrevCustomer = () => { if (currentCustomerPage > 1) setCurrentCustomerPage(currentCustomerPage - 1); };
  const handleNextCustomer = () => { if (currentCustomerPage < totalCustomerPages) setCurrentCustomerPage(currentCustomerPage + 1); };

  const formattedCustomerPage = String(currentCustomerPage).padStart(2, '0');
  const formattedTotalCustomerPages = String(totalCustomerPages).padStart(2, '0');

  return (
    <main>
      {/* ================= SECTION: ALL PRODUCTS ================= */}
      <section className="container">
        <ScrollReveal className="section-header">
          <span className="section-subtitle">A GIFT WITH A STORY</span>
          <h2 className="section-title">All Products!</h2>
          <p className="section-desc">Các sản phẩm nổi bật & mới nhất</p>
        </ScrollReveal>

        <div className="news-grid">
          {currentNews.map((item, index) => {
            // Tính toán logic Apple Dock Effect
            const isHovered = hoveredNewsIndex === index;
            const isAdjacent = hoveredNewsIndex !== null && Math.abs(hoveredNewsIndex - index) === 1;
            
            let scale = 1;
            let y = 0;
            let zIndex = 1;
            
            if (isHovered) {
              scale = 1.15; // Thẻ được trỏ chuột phóng to nhất
              y = -10;
              zIndex = 10;  // Nổi lên trên cùng
            } else if (isAdjacent) {
              scale = 1.05; // 2 Thẻ nằm sát bên cạnh phóng to vừa vừa
              y = -5;
              zIndex = 5;   // Nổi thứ nhì
            }

            return (
              <motion.div
                key={item.id}
                className="news-card"
                onClick={() => onSelectProduct(item)}
                onMouseEnter={() => setHoveredNewsIndex(index)}
                onMouseLeave={() => setHoveredNewsIndex(null)}
                style={{ cursor: 'pointer', zIndex }}
                animate={{ scale, y }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 500, damping: 25, mass: 0.5 }}
              >
                <div className="news-sidebar">
                  <span className="vertical-date">{item.date}</span>
                </div>
                <div className="news-content">
                  <div className="news-image">
                    {item.videoUrl ? (
                      <video
                        src={`${import.meta.env.BASE_URL}${item.videoUrl}`}
                        poster={`${import.meta.env.BASE_URL}${item.imageUrl}`}
                        muted
                        autoPlay
                        loop
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <img src={`${import.meta.env.BASE_URL}${item.imageUrl}`} alt={item.title} />
                    )}
                  </div>
                  <p className="news-text">{item.title}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="carousel-controls">
          <button className="btn-arrow" onClick={handlePrevNews} disabled={currentNewsPage === 1} style={{ opacity: currentNewsPage === 1 ? 0.3 : 1, cursor: currentNewsPage === 1 ? 'not-allowed' : 'pointer' }}>←</button>
          <span className="carousel-page">{formattedCurrentPage} — {formattedTotalPages}</span>
          <button className="btn-arrow" onClick={handleNextNews} disabled={currentNewsPage === totalNewsPages} style={{ opacity: currentNewsPage === totalNewsPages ? 0.3 : 1, cursor: currentNewsPage === totalNewsPages ? 'not-allowed' : 'pointer' }}>→</button>
        </div>
      </section>

      {/* ================= SECTION: OUR CUSTOMERS (MÀU XANH) ================= */}
      <section className="customers-section">
        <div className="container">
          <ScrollReveal className="section-header">
            <span className="section-subtitle">THANK YOU FOR CHOOSING US</span>
            <h2 className="section-title">Our Customers!</h2>
            <p className="section-desc">Vinh danh & tri ân những khách hàng đã tin tưởng Future Studio</p>
          </ScrollReveal>

          <div className="news-grid">
            {currentCustomers.map((item, index) => {
              // Tính toán logic Apple Dock Effect
              const isHovered = hoveredCustomerIndex === index;
              const isAdjacent = hoveredCustomerIndex !== null && Math.abs(hoveredCustomerIndex - index) === 1;
              
              let scale = 1;
              let y = 0;
              let zIndex = 1;
              
              if (isHovered) {
                scale = 1.15;
                y = -10;
                zIndex = 10;
              } else if (isAdjacent) {
                scale = 1.05;
                y = -5;
                zIndex = 5;
              }

              return (
                <motion.div
                  key={item.id}
                  className="news-card"
                  onClick={() => onSelectProduct(item)}
                  onMouseEnter={() => setHoveredCustomerIndex(index)}
                  onMouseLeave={() => setHoveredCustomerIndex(null)}
                  style={{ cursor: 'pointer', zIndex }}
                  animate={{ scale, y }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25, mass: 0.5 }}
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
              );
            })}
          </div>

          <div className="carousel-controls" style={{ marginBottom: '0px', paddingBottom: '40px' }}>
            <button className="btn-arrow" onClick={handlePrevCustomer} disabled={currentCustomerPage === 1} style={{ opacity: currentCustomerPage === 1 ? 0.3 : 1, cursor: currentCustomerPage === 1 ? 'not-allowed' : 'pointer' }}>←</button>
            <span className="carousel-page">{formattedCustomerPage} — {formattedTotalCustomerPages}</span>
            <button className="btn-arrow" onClick={handleNextCustomer} disabled={currentCustomerPage === totalCustomerPages} style={{ opacity: currentCustomerPage === totalCustomerPages ? 0.3 : 1, cursor: currentCustomerPage === totalCustomerPages ? 'not-allowed' : 'pointer' }}>→</button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Body;
