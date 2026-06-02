import React, { useState, useEffect } from 'react';
import { CiMenuBurger } from "react-icons/ci";

// 🔥 DÒNG MỚI THÊM: Kết nối và lấy thẳng dữ liệu từ kho lưu trữ riêng
import { newsData, customerData, heroImages,type NewsItem } from './data/database';

/* =====================================================================
   2. COMPONENT HEADER
   ===================================================================== */
interface HeaderProps {
  onHeroClick: (index: number | null) => void;
}

const Header: React.FC<HeaderProps> = ({ onHeroClick }) => {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [showFixedHeader, setShowFixedHeader] = useState(false);

  useEffect(() => {
    const heroInterval = setInterval(() => {
      setCurrentHeroSlide((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(heroInterval);
  }, [currentHeroSlide]);

  const handlePrevHero = () => {
    setCurrentHeroSlide((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));
  };

  const handleNextHero = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 800) {
        setShowFixedHeader(true);
      } else {
        setShowFixedHeader(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="site-header-wrapper">
      <div className="hero-full-container">
        <div className={`main-header ${showFixedHeader ? 'fixed-active' : ''}`}>
          <div className="header-logo" onClick={() => onHeroClick(null)} style={{ cursor: 'pointer' }}>
            Future Studio
          </div>
          
          <div className="header-nav">
            <div className="search-bar">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>Tìm kiếm</span>
            </div>
            <div className="menu-burger">
              <CiMenuBurger size={24} />
            </div> 
          </div>
        </div>

        <div className="hero-slider-wrapper">
          <button className="hero-nav-btn prev" onClick={handlePrevHero}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>

          <div className="hero-frame">
            {heroImages.map((img, index) => (
              <div
                key={index}
                className="hero-slide"
                style={{
                  backgroundImage: `url(${img})`,
                  opacity: index === currentHeroSlide ? 1 : 0,
                  cursor: 'pointer'
                }}
                onClick={() => onHeroClick(index)}
              />
            ))}

            <div className="hero-dots">
              {heroImages.map((_, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentHeroSlide(index)}
                  className={`hero-dot ${index === currentHeroSlide ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>

          <button className="hero-nav-btn next" onClick={handleNextHero}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
        
        <div className="hero-bottom-action">
          <button className="btn-dozo-about">Future Studio là gì?</button>
        </div>
      </div>
    </header>
  );
};


/* =====================================================================
   3. COMPONENT BODY
   ===================================================================== */
const Body: React.FC = () => {
  // State điều hướng nội bộ khi click xem chi tiết ảnh sản phẩm hoặc khách hàng
  const [selectedProduct, setSelectedProduct] = useState<NewsItem | null>(null);

  // LOGIC PHÂN TRANG: ALL PRODUCTS
  const [currentNewsPage, setCurrentNewsPage] = useState(1);
  const itemsPerPage = 4;
  const totalNewsPages = Math.ceil(newsData.length / itemsPerPage);
  const currentNews = newsData.slice((currentNewsPage - 1) * itemsPerPage, currentNewsPage * itemsPerPage);

  const handlePrevNews = () => { if (currentNewsPage > 1) setCurrentNewsPage(currentNewsPage - 1); };
  const handleNextNews = () => { if (currentNewsPage < totalNewsPages) setCurrentNewsPage(currentNewsPage + 1); };

  const formattedCurrentPage = String(currentNewsPage).padStart(2, '0');
  const formattedTotalPages = String(totalNewsPages).padStart(2, '0');

  // LOGIC PHÂN TRANG: OUR CUSTOMERS
  const [currentCustomerPage, setCurrentCustomerPage] = useState(1);
  const customersPerPage = 4;
  const totalCustomerPages = Math.ceil(customerData.length / customersPerPage);
  const currentCustomers = customerData.slice((currentCustomerPage - 1) * customersPerPage, currentCustomerPage * customersPerPage);

  const handlePrevCustomer = () => { if (currentCustomerPage > 1) setCurrentCustomerPage(currentCustomerPage - 1); };
  const handleNextCustomer = () => { if (currentCustomerPage < totalCustomerPages) setCurrentCustomerPage(currentCustomerPage + 1); };

  const formattedCustomerPage = String(currentCustomerPage).padStart(2, '0');
  const formattedTotalCustomerPages = String(totalCustomerPages).padStart(2, '0');

  // HIỆU ỨNG: Cuộn tới đâu bật animation tới đó
  useEffect(() => {
    if (selectedProduct) return;
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
  }, [selectedProduct]);

  // GIAO DIỆN TRANG CHI TIẾT KHI CLICK VÀO ẢNH BẤT KỲ VỚI NÚT QUAY LẠI ĐỒNG BỘ
  if (selectedProduct) {
    return (
      <section className="container" style={{ paddingTop: '60px', paddingBottom: '100px' }}>
        <button 
          onClick={() => setSelectedProduct(null)} 
          className="btn-arrow" 
          style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto', padding: '0 16px' }}
        >
          ← Quay lại trang chủ
        </button>

        <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
            <img src={selectedProduct.imageUrl} alt={selectedProduct.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#666666', display: 'block', marginBottom: '8px' }}>
              PUBLISHED AT: {selectedProduct.date}
            </span>
            <h1 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1.4', marginBottom: '24px' }}>
              {selectedProduct.title}
            </h1>
            <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#444444', marginBottom: '32px' }}>
              <p style={{ marginBottom: '16px' }}>
                Đây là trang hiển thị thông tin chi tiết đầy đủ của nội dung thuộc hệ thống Future Studio. Tại đây, khách hàng có thể tìm hiểu sâu hơn về nguồn gốc, câu chuyện nghệ thuật ẩn sau sản phẩm và các quy trình chế tác tỉ mỉ.
              </p>
              <p>
                Mọi chi tiết thiết kế đều được đội ngũ biên tập viên tuyển chọn kỹ càng nhằm đem lại trải nghiệm tinh tế và độc bản nhất dành riêng cho bạn.
              </p>
            </div>
            <button className="btn-primary-black">Liên hệ Future Studio ngay</button>
          </div>
        </div>
      </section>
    );
  }

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
            <div key={item.id} className="news-card" onClick={() => setSelectedProduct(item)} style={{ cursor: 'pointer' }}>
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
              <div key={item.id} className="news-card" onClick={() => setSelectedProduct(item)} style={{ cursor: 'pointer' }}>
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


/* =====================================================================
   4. COMPONENT FOOTER
   ===================================================================== */
const Footer: React.FC = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-logo-block">
          <h2 className="footer-logo">Future Studio</h2>
        </div>
        <div className="footer-socials">
          <a href="#x" className="social-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
          </a>
          <a href="#line" className="social-icon icon-line">LINE</a>
          <a href="#ig" className="social-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
        </div>
        <nav className="footer-primary-nav">
          <a href="#1">Tìm quà</a><a href="#2">Future là gì?</a><a href="#3">Cách cho và nhận</a><a href="#4">Đăng nhập/đăng ký thành viên mới</a>
        </nav>
        <div className="footer-secondary-links">
          <a href="#faq">Những câu hỏi thường gặp</a><span className="separator">|</span><a href="#contact">Liên hệ</a><span className="separator">|</span><a href="#review">Đăng đánh giá</a><span className="separator">|</span><a href="#b2b">Dịch vụ doanh nghiệp</a><span className="separator">|</span><a href="#privacy">Chính sách bảo mật</a><span className="separator">|</span><a href="#terms">Điều khoản sử dụng</a><span className="separator">|</span><a href="#company">Công ty quản lý</a><span className="separator">|</span><a href="#legal">Mô tả dựa trên Luật Giao dịch thương mại cụ thể</a>
        </div>
        <div className="footer-payments">
          <span className="payment-icon amex">AMEX</span><span className="payment-icon apple"> Pay</span><span className="payment-icon gpay">G Pay</span><span className="payment-icon jcb">JCB</span><span className="payment-icon master">mastercard</span><span className="payment-icon shop">shop</span><span className="payment-icon visa">VISA</span>
        </div>
      </div>
      <div className="footer-bottom"><p>©2026 Future Studio</p></div>
    </footer>
  );
};


/* =====================================================================
   5. COMPONENT GỐC (APP) LẮP RÁP TẤT CẢ
   ===================================================================== */
const App: React.FC = () => {
  const [selectedHeroIndex, setSelectedHeroIndex] = useState<number | null>(null);

  const handleHeroClick = (index: number | null) => {
    setSelectedHeroIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <Header onHeroClick={handleHeroClick} />
      
      {selectedHeroIndex !== null ? (
        <section className="container" style={{ paddingTop: '60px', paddingBottom: '100px' }}>
          <button 
            onClick={() => handleHeroClick(null)} 
            className="btn-arrow" 
            style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto', padding: '0 16px', borderRadius: '8px' }}
          >
            ← Quay lại trang chủ
          </button>

          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#f5f5f5', overflow: 'hidden', borderRadius: '8px' }}>
              <img src={heroImages[selectedHeroIndex]} alt={`Banner event ${selectedHeroIndex + 1}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>

            <div style={{ flex: 1, minWidth: '300px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#666666', display: 'block', marginBottom: '8px', letterSpacing: '0.1em' }}>
                FUTURE STUDIO — HERO EVENT #{selectedHeroIndex + 1}
              </span>
              <h1 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1.4', marginBottom: '24px', color: '#111111' }}>
                Chi tiết chiến dịch cốt truyện & Bộ sưu tập độc quyền {selectedHeroIndex + 1}
              </h1>
              <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#444444', marginBottom: '32px' }}>
                <p style={{ marginBottom: '16px' }}>
                  Chào mừng bạn đến với trang thông tin đặc biệt được liên kết trực tiếp từ ảnh quảng cáo trang đầu của Future Studio. Mỗi banner đại diện cho một chiến dịch truyền thông lớn hoặc một chương câu chuyện nghệ thuật riêng biệt mà studio muốn truyền tải đến khách hàng.
                </p>
                <p>
                  Tại không gian này, bạn có thể thoải mái đọc thêm nội dung giới thiệu chi tiết các dòng sản phẩm giới hạn đi kèm, các chương trình tri ân hoặc định hướng thiết kế của bộ ảnh visual tương ứng.
                </p>
              </div>
              <button className="btn-primary-black">Tham gia sự kiện ngay</button>
            </div>
          </div>
        </section>
      ) : (
        <Body />
      )}
      
      <Footer />
    </div>
  );
};

export default App;