import React, { useState, useEffect } from 'react';
import { newsData, customerData, type NewsItem } from '../data/database';

interface BodyProps {
  onSelectProduct: (item: NewsItem) => void;
}

const Body: React.FC<BodyProps> = ({ onSelectProduct }) => {
  // LOGIC PHÂN TRANG: ALL PRODUCTS
  const [currentNewsPage, setCurrentNewsPage] = useState(1);
  const itemsPerPage = 4;

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
  const customersPerPage = 4;

  const sortedCustomerData = [...customerData].sort((a, b) => {
    return new Date(b.date.replace(/\./g, '-')).getTime() - new Date(a.date.replace(/\./g, '-')).getTime();
  });
  const totalCustomerPages = Math.ceil(sortedCustomerData.length / customersPerPage);
  const currentCustomers = sortedCustomerData.slice((currentCustomerPage - 1) * customersPerPage, currentCustomerPage * customersPerPage);

  const handlePrevCustomer = () => { if (currentCustomerPage > 1) setCurrentCustomerPage(currentCustomerPage - 1); };
  const handleNextCustomer = () => { if (currentCustomerPage < totalCustomerPages) setCurrentCustomerPage(currentCustomerPage + 1); };

  const formattedCustomerPage = String(currentCustomerPage).padStart(2, '0');
  const formattedTotalCustomerPages = String(totalCustomerPages).padStart(2, '0');

  // HIỆU ỨNG: Cuộn tới đâu bật animation tới đó
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      {/* ================= SECTION: ALL PRODUCTS ================= */}
      <section className="container">
        <div className="section-header scroll-reveal">
          <span className="section-subtitle">A GIFT WITH A STORY</span>
          <h2 className="section-title">All Products!</h2>
          <p className="section-desc">Các sản phẩm nổi bật & mới nhất</p>
        </div>

        <div className="news-grid">
          {currentNews.map((item) => (
            <div key={item.id} className="news-card" onClick={() => onSelectProduct(item)} style={{ cursor: 'pointer' }}>
              <div className="news-sidebar">
                <span className="vertical-date">{item.date}</span>
              </div>
              <div className="news-content">
                <div className="news-image">
                  {item.videoUrl ? (
                    <video
                      src={`/${item.videoUrl}`}
                      poster={`/${item.imageUrl}`}
                      muted
                      autoPlay
                      loop
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img src={`/${item.imageUrl}`} alt={item.title} />
                  )}
                </div>
                <p className="news-text">{item.title}</p>
              </div>
            </div>
          ))}
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
          <div className="section-header scroll-reveal">
            <span className="section-subtitle">THANK YOU FOR CHOOSING US</span>
            <h2 className="section-title">Our Customers!</h2>
            <p className="section-desc">Vinh danh & tri ân những khách hàng đã tin tưởng Future Studio</p>
          </div>

          <div className="news-grid">
            {currentCustomers.map((item) => (
              <div key={item.id} className="news-card" onClick={() => onSelectProduct(item)} style={{ cursor: 'pointer' }}>
                <div className="news-sidebar">
                  <span className="vertical-date">{item.date}</span>
                </div>
                <div className="news-content">
                  <div className="news-image">
                    <img src={`/${item.imageUrl}`} alt={item.title} />
                  </div>
                  <p className="news-text">{item.title}</p>
                </div>
              </div>
            ))}
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
