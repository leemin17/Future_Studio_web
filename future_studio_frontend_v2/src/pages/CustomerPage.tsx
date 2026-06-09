import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { customerData, type NewsItem } from '../data/database';
import ScrollReveal from '../components/ScrollReveal';

const CustomerPage: React.FC = () => {
  const navigate = useNavigate();

  // Logic for pagination
  const [currentCustomerPage, setCurrentCustomerPage] = useState(1);
  const customersPerPage = 8; // Hiển thị nhiều mục hơn trên một trang riêng

  // Sắp xếp khách hàng theo ngày mới nhất
  const sortedCustomerData = [...customerData].sort((a, b) => {
    return new Date(b.date.replace(/\./g, '-')).getTime() - new Date(a.date.replace(/\./g, '-')).getTime();
  });
  const totalCustomerPages = Math.ceil(sortedCustomerData.length / customersPerPage);
  const currentCustomers = sortedCustomerData.slice(
    (currentCustomerPage - 1) * customersPerPage,
    currentCustomerPage * customersPerPage
  );

  const handlePrevCustomer = () => { if (currentCustomerPage > 1) setCurrentCustomerPage(currentCustomerPage - 1); };
  const handleNextCustomer = () => { if (currentCustomerPage < totalCustomerPages) setCurrentCustomerPage(currentCustomerPage + 1); };

  const formattedCustomerPage = String(currentCustomerPage).padStart(2, '0');
  const formattedTotalCustomerPages = String(totalCustomerPages).padStart(2, '0');

  // Handler for clicking on a customer/product
  const handleProductClick = (item: NewsItem) => {
    navigate(`/product/${item.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="customers-section">
      <div className="container">
        <ScrollReveal className="section-header" style={{ paddingTop: '60px' }}>
          <span className="section-subtitle">THANK YOU FOR CHOOSING US</span>
          <h2 className="section-title">Our Customers!</h2>
          <p className="section-desc">Vinh danh & tri ân những khách hàng đã tin tưởng Future Studio</p>
        </ScrollReveal>

        <div className="news-grid">
          {currentCustomers.map((item) => (
            <motion.div
              key={item.id}
              className="news-card"
              onClick={() => handleProductClick(item)}
              style={{ cursor: 'pointer' }}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
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

        <div className="carousel-controls" style={{ marginBottom: '0px', paddingBottom: '40px' }}>
          <button className="btn-arrow" onClick={handlePrevCustomer} disabled={currentCustomerPage === 1}>←</button>
          <span className="carousel-page">{formattedCustomerPage} — {formattedTotalCustomerPages}</span>
          <button className="btn-arrow" onClick={handleNextCustomer} disabled={currentCustomerPage === totalCustomerPages}>→</button>
        </div>
      </div>
    </section>
  );
};

export default CustomerPage;