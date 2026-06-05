import React, { useState, useEffect } from 'react';
import { newsData, type NewsItem } from '../data/database';

interface BodyProps {
  onSelectProduct: (item: NewsItem) => void;
}

const Body: React.FC<BodyProps> = ({ onSelectProduct }) => {
  // LOGIC PHÂN TRANG: ALL PRODUCTS
  const [currentNewsPage, setCurrentNewsPage] = useState(1);
  const itemsPerPage = 4;
  const totalNewsPages = Math.ceil(newsData.length / itemsPerPage);
  const currentNews = newsData.slice((currentNewsPage - 1) * itemsPerPage, currentNewsPage * itemsPerPage);

  const handlePrevNews = () => { if (currentNewsPage > 1) setCurrentNewsPage(currentNewsPage - 1); };
  const handleNextNews = () => { if (currentNewsPage < totalNewsPages) setCurrentNewsPage(currentNewsPage + 1); };

  const formattedCurrentPage = String(currentNewsPage).padStart(2, '0');
  const formattedTotalPages = String(totalNewsPages).padStart(2, '0');


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
                  <img src={item.imageUrl} alt={item.title} />
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
    </main>
  );
};

export default Body;
