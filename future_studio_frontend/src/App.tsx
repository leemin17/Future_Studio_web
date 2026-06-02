import React, { useState, useEffect } from 'react';
import { CiMenuBurger } from "react-icons/ci";



/* =====================================================================
   1. KIỂU DỮ LIỆU & DỮ LIỆU TĨNH (CONST DATA)
   ===================================================================== */
interface NewsItem {
  id: number;
  date: string;
  title: string;
  imageUrl: string;
}

interface ProductItem {
  id: number;
  tag: string;
  title: string;
  highlightTag?: string;
  price?: string;
  description?: string;
  imageUrl: string;
}

// Kiểu dữ liệu mới cho danh sách khách hàng vinh danh
interface CustomerItem {
  id: number;
  date: string;
  title: string;
  imageUrl: string;
}


// Data cho Slider (Hero)
const heroImages = [
  'images/_mainvisual-001.png',
  'images/FINAL_COMP.png',
  'images/_mainvisual-001.png',
];

// Data cho Tin tức (What's new)
const newsData: NewsItem[] = [
  { id: 1, date: '2024.04.05', title: 'future team tuyển dụng thành viên cho team', imageUrl: 'images/black_text_logo.png' },
  { id: 2, date: '2024.03.26', title: 'Quà cưới cũng là quà tặng cho "chú rể" tốt nhất', imageUrl: 'images/logo.jpg' },
  { id: 3, date: '2024.04.09', title: 'Mọi người dùng nó như thế nào? Cách người dùng có th...', imageUrl: 'images/jobiterview.jpg' },
  { id: 4, date: '2024.03.18', title: 'Nhìn! Future Studio GOD 👑 Giới thiệu hàng hóa dành riêng...', imageUrl: 'images/jobiterview.jpg' },
  { id: 5, date: '2024.03.10', title: 'Dự án phim hoạt hình mới chính thức bấm máy.', imageUrl: 'images/jobiterview.jpg' },
  { id: 6, date: '2024.02.28', title: 'Khai giảng khóa học 3D Animation cơ bản.', imageUrl: 'images/jobiterview.jpg' },
  { id: 7, date: '2024.02.15', title: 'Tham quan Studio: Hậu trường phía sau những thước phim.', imageUrl: 'images/jobiterview.jpg' },
  { id: 8, date: '2024.01.20', title: 'Future Studio lọt top studio sáng tạo của năm!', imageUrl: 'images/jobiterview.jpg' }
];

// Data mới cho Khách hàng (Our Customers)
const customerData: CustomerItem[] = [
  { id: 1, date: 'THANK YOU', title: 'Dự án quà tặng kỷ niệm ngày thành lập tập đoàn đối tác', imageUrl: 'images/logo.jpg' },
  { id: 2, date: 'CREATIVE', title: 'Bộ quà tặng sáng tạo độc quyền thiết kế riêng cho khách hàng VIP', imageUrl: 'images/black_text_logo.png' },
  { id: 3, date: 'STUDIO', title: 'Đơn hàng 500 set quà bàn giao thành công cho studio nghệ thuật', imageUrl: 'images/jobiterview.jpg' },
  { id: 4, date: 'TRUSTED', title: 'Hợp tác sản xuất hộp quà cao cấp cùng thương hiệu Local Brand', imageUrl: 'images/logo.jpg' },
  { id: 5, date: '2026', title: 'Sự kiện tri ân các khách hàng thân thiết đồng hành cùng Future Studio', imageUrl: 'images/jobiterview.jpg' }
];

// Data cho Sản phẩm (Pick up) - Đã thêm data để test chuyển trang
const productData: ProductItem[] = [
  {
    id: 1, tag: '#23', title: 'Hãy yêu tôi!', highlightTag: 'Đề nghị tháng này', price: '¥3.740',
    description: 'Người đó luôn làm việc chăm chỉ. Người đó luôn làm việc nhà hết sức mình. Ngư...',
    imageUrl: 'images/product1.jpg'
  },
  {
    id: 2, tag: '#17', title: 'Mỗi ngày là một ngày tốt lành', highlightTag: 'Đề nghị tháng này', price: '¥3.080',
    description: 'Từ nay cũng dành sự dung thứ một kỉ! Trò chơi cáo nghỉ là bài đạo. "Mỗi ngày l...',
    imageUrl: 'images/product2.jpg'
  },
  {
    id: 3, tag: 'Thợ săn băng số 21', title: '', price: '¥3.740',
    description: 'Grrr... Bạn đã tìm thấy loại hương vị nào ở cửa hàng tiện lợi? Đây là một loại kẹ...',
    imageUrl: 'images/product3.jpg'
  },
  {
    id: 4, tag: '#48', title: 'Dành riêng cho những người yêu thích nấu ăn.', price: '¥5.170',
    description: 'Bản rhapsody này dành riêng cho những người yêu thích nấu ăn... Không phải...',
    imageUrl: 'images/product4.jpg'
  },
  // --- Trang 2 ---
  {
    id: 5, tag: '#99', title: 'Món quà bất ngờ', highlightTag: 'Hot', price: '¥4.200',
    description: 'Dành cho những người bạn yêu thương nhất. Phiên bản giới hạn mùa này...',
    imageUrl: 'images/product1.jpg'
  },
  {
    id: 6, tag: '#88', title: 'Ngày nắng đẹp', price: '¥2.100',
    description: 'Mang lại cảm giác ấm áp và thư giãn sau một ngày dài làm việc mệt mỏi...',
    imageUrl: 'images/product2.jpg'
  },
  {
    id: 7, tag: 'Bí mật số 7', title: '', price: '¥1.500',
    description: 'Khám phá những điều thú vị được giấu kín bên trong hộp quà nhỏ nhắn này...',
    imageUrl: 'images/product3.jpg'
  },
  {
    id: 8, tag: '#77', title: 'Bộ sưu tập mùa đông', price: '¥6.000',
    description: 'Giữ ấm cho mùa đông lạnh giá với bộ sưu tập đặc biệt từ chúng tôi...',
    imageUrl: 'images/product4.jpg'
  }
];

// Data cho Truyện tranh (How to use) - Đã thêm data để test chuyển trang
const comicImages = [
  'images/comic1.jpg',
  'images/comic2.jpg',
  'images/comic3.jpg',
  'images/comic4.jpg',
  // --- Trang 2 ---
  'images/comic1.jpg',
  'images/comic2.jpg',
  'images/comic3.jpg',
  'images/comic4.jpg',
];


/* =====================================================================
   2. COMPONENT HEADER
   ===================================================================== */
const Header: React.FC = () => {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // STATE MỚI: Quản lý việc hiện Header khi cuộn xuống Body
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

  // HIỆU ỨNG MỚI: Bắt sự kiện cuộn chuột
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

      {/* Hero Section (Đã bao gồm Header ở bên trong) */}
      <div className="hero-full-container">

        {/* Đưa Main Nav vào đây, nằm ngay trên hero-frame */}
        <div className={`main-header ${showFixedHeader ? 'fixed-active' : ''}`}>
          <div className="header-logo">Future Studio</div>
          
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

        {/* Khung chứa ảnh Banner */}
        <div className="hero-slider-wrapper">
          
          {/* Đưa nút Lùi ra đây */}
          <button className="hero-nav-btn prev" onClick={handlePrevHero}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>

          {/* Khung chứa ảnh Banner vẫn giữ nguyên */}
          <div className="hero-frame">
            {heroImages.map((img, index) => (
              <div
                key={index}
                className="hero-slide"
                style={{
                  backgroundImage: `url(${img})`,
                  opacity: index === currentHeroSlide ? 1 : 0
                }}
              />
            ))}

            {/* Dấu chấm tròn vẫn nằm trong ảnh */}
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

          {/* Đưa nút Tiến ra đây */}
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
  // ----------------------------------------------------
  // LOGIC PHÂN TRANG: WHAT'S NEW
  const [currentNewsPage, setCurrentNewsPage] = useState(1);
  const itemsPerPage = 4;
  const totalNewsPages = Math.ceil(newsData.length / itemsPerPage);
  const currentNews = newsData.slice((currentNewsPage - 1) * itemsPerPage, currentNewsPage * itemsPerPage);

  const handlePrevNews = () => { if (currentNewsPage > 1) setCurrentNewsPage(currentNewsPage - 1); };
  const handleNextNews = () => { if (currentNewsPage < totalNewsPages) setCurrentNewsPage(currentNewsPage + 1); };

  const formattedCurrentPage = String(currentNewsPage).padStart(2, '0');
  const formattedTotalPages = String(totalNewsPages).padStart(2, '0');

  // ----------------------------------------------------
  // LOGIC PHÂN TRANG: VINH DANH KHÁCH HÀNG (MỚI THÊM)
  const [currentCustomerPage, setCurrentCustomerPage] = useState(1);
  const customersPerPage = 4;
  const totalCustomerPages = Math.ceil(customerData.length / customersPerPage);
  const currentCustomers = customerData.slice((currentCustomerPage - 1) * customersPerPage, currentCustomerPage * customersPerPage);

  const handlePrevCustomer = () => { if (currentCustomerPage > 1) setCurrentCustomerPage(currentCustomerPage - 1); };
  const handleNextCustomer = () => { if (currentCustomerPage < totalCustomerPages) setCurrentCustomerPage(currentCustomerPage + 1); };

  const formattedCustomerPage = String(currentCustomerPage).padStart(2, '0');
  const formattedTotalCustomerPages = String(totalCustomerPages).padStart(2, '0');

  // ----------------------------------------------------
  // LOGIC PHÂN TRANG: PICK UP (TẠM ẨN GIAO DIỆN)
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const productsPerPage = 4;
  const totalProductPages = Math.ceil(productData.length / productsPerPage);
  const currentProducts = productData.slice((currentProductPage - 1) * productsPerPage, currentProductPage * productsPerPage);

  const handlePrevProduct = () => { if (currentProductPage > 1) setCurrentProductPage(currentProductPage - 1); };
  const handleNextProduct = () => { if (currentProductPage < totalProductPages) setCurrentProductPage(currentProductPage + 1); };

  const formattedProductPage = String(currentProductPage).padStart(2, '0');
  const formattedTotalProductPages = String(totalProductPages).padStart(2, '0');

  // ----------------------------------------------------
  // LOGIC PHÂN TRANG: HOW TO USE (TẠM ẨN GIAO DIỆN)
  const [currentComicPage, setCurrentComicPage] = useState(1);
  const comicsPerPage = 4;
  const totalComicPages = Math.ceil(comicImages.length / comicsPerPage);
  const currentComics = comicImages.slice((currentComicPage - 1) * comicsPerPage, currentComicPage * comicsPerPage);

  const handlePrevComic = () => { if (currentComicPage > 1) setCurrentComicPage(currentComicPage - 1); };
  const handleNextComic = () => { if (currentComicPage < totalComicPages) setCurrentComicPage(currentComicPage + 1); };

  const formattedComicPage = String(currentComicPage).padStart(2, '0');
  const formattedTotalComicPages = String(totalComicPages).padStart(2, '0');

  // ----------------------------------------------------
  // HIỆU ỨNG MỚI: Kích hoạt khi cuộn chuột tới (Scroll Reveal)
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
      {/* ================= SECTION: WHAT'S NEW / ALL PRODUCTS ================= */}
      <section className="container">
        <div className="section-header scroll-reveal">
          <span className="section-subtitle">A GIFT WITH A STORY</span>
          <h2 className="section-title">All Products!</h2>
          <p className="section-desc">Các sản phẩm nổi bật & mới nhất</p>
        </div>

        <div className="news-grid">
          {currentNews.map((item) => (
            <div key={item.id} className="news-card">

              {/* Cột hiển thị ngày tháng dọc và đường kẻ */}
              <div className="news-sidebar">
                <span className="vertical-date">{item.date}</span>
              </div>

              {/* Cột hiển thị hình ảnh và tiêu đề */}
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

      {/* ================= SECTION: OUR CUSTOMERS (MÀU XANH GIỐNG PICKUP) ================= */}
      <section className="customers-section">
        <div className="container">
          <div className="section-header scroll-reveal">
            <span className="section-subtitle">THANK YOU FOR CHOOSING US</span>
            <h2 className="section-title">Our Customers!</h2>
            <p className="section-desc">Vinh danh & tri ân những khách hàng đã tin tưởng Future Studio</p>
          </div>

          <div className="news-grid">
            {currentCustomers.map((item) => (
              <div key={item.id} className="news-card">
                {/* Cột chữ dọc bên sườn */}
                <div className="news-sidebar">
                  <span className="vertical-date">{item.date}</span>
                </div>
                {/* Cột nội dung hình ảnh & chữ */}
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

      
      {/* <section className="pickup-section">
        <div className="container">
          <div className="section-header scroll-reveal">
            <span className="section-subtitle">A GIFT WITH A STORY</span>
            <h2 className="section-title">Pick up</h2>
            <p className="section-desc">Sản phẩm nổi bật tháng này từ Future Studio!</p>
          </div>

          <div className="product-grid">
            {currentProducts.map((prod) => (
              <div key={prod.id} className="product-card">
                <div className="image-container-square">
                  <img src={prod.imageUrl} alt={prod.title || prod.tag} />
                </div>
                <div className="product-info-block">
                  <p className="product-title-bold">{prod.tag} {prod.title}</p>
                  <div className="product-price-row">
                    {prod.highlightTag ? <span className="highlight-yellow">{prod.highlightTag}</span> : <span></span>}
                    <span className="product-price">{prod.price}</span>
                  </div>
                  <p className="product-desc">{prod.description}</p>
                  <button className="btn-black-small">Xem chi tiết</button>
                </div>
              </div>
            ))}
          </div>

          <div className="carousel-controls">
            <button className="btn-arrow" onClick={handlePrevProduct} disabled={currentProductPage === 1} style={{ opacity: currentProductPage === 1 ? 0.3 : 1, cursor: currentProductPage === 1 ? 'not-allowed' : 'pointer' }}>←</button>
            <span className="carousel-page">{formattedProductPage} — {formattedTotalProductPages}</span>
            <button className="btn-arrow" onClick={handleNextProduct} disabled={currentProductPage === totalProductPages} style={{ opacity: currentProductPage === totalProductPages ? 0.3 : 1, cursor: currentProductPage === totalProductPages ? 'not-allowed' : 'pointer' }}>→</button>
          </div>
        </div>
      </section> */}

      {/* ================= SECTION: HOW TO USE ================= */}
      {/* <section className="how-to-use-section">
        <div className="container">
          <div className="section-header scroll-reveal">
            <span className="section-subtitle">A GIFT WITH A STORY</span>
            <h2 className="section-title">How to use</h2>
            <p className="section-desc">Một câu chuyện bắt đầu với Future Studio</p>
          </div>

          <div className="how-to-text">
            <p>Dozo là món quà mà người nhận thích</p>
          </div>

          <div className="comic-grid">
            {currentComics.map((img, idx) => (
              <div key={idx} className="comic-panel">
                <img src={img} alt={`Comic panel ${idx + 1}`} />
              </div>
            ))}
          </div>

          <div className="carousel-controls">
            <button className="btn-arrow" onClick={handlePrevComic} disabled={currentComicPage === 1} style={{ opacity: currentComicPage === 1 ? 0.3 : 1, cursor: currentComicPage === 1 ? 'not-allowed' : 'pointer' }}>←</button>
            <span className="carousel-page">{formattedComicPage} — {formattedTotalComicPages}</span>
            <button className="btn-arrow" onClick={handleNextComic} disabled={currentComicPage === totalComicPages} style={{ opacity: currentComicPage === totalComicPages ? 0.3 : 1, cursor: currentComicPage === totalComicPages ? 'not-allowed' : 'pointer' }}>→</button>
          </div>

          <div className="center-button-wrapper">
            <button className="btn-primary-black">Cách sử dụng Future Studio</button>
          </div>
        </div>
      </section> */}

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

        {/* Logo */}
        <div className="footer-logo-block">
          <h2 className="footer-logo">Future Studio</h2>
        </div>

        {/* Social Icons */}
        <div className="footer-socials">
          <a href="#x" className="social-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
              <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
            </svg>
          </a>
          <a href="#line" className="social-icon icon-line">LINE</a>
          <a href="#ig" className="social-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        </div>

        {/* Menu chính */}
        <nav className="footer-primary-nav">
          <a href="#1">Tìm quà</a>
          <a href="#2">Future là gì?</a>
          <a href="#3">Cách cho và nhận</a>
          <a href="#4">Đăng nhập/đăng ký thành viên mới</a>
        </nav>

        {/* Menu phụ */}
        <div className="footer-secondary-links">
          <a href="#faq">Những câu hỏi thường gặp</a><span className="separator">|</span>
          <a href="#contact">Liên hệ</a><span className="separator">|</span>
          <a href="#review">Đăng đánh giá</a><span className="separator">|</span>
          <a href="#b2b">Dịch vụ doanh nghiệp</a><span className="separator">|</span>
          <a href="#privacy">Chính sách bảo mật</a><span className="separator">|</span>
          <a href="#terms">Điều khoản sử dụng</a><span className="separator">|</span>
          <a href="#company">Công ty quản lý</a><span className="separator">|</span>
          <a href="#legal">Mô tả dựa trên Luật Giao dịch thương mại cụ thể</a>
        </div>

        {/* Thanh toán */}
        <div className="footer-payments">
          <span className="payment-icon amex">AMEX</span>
          <span className="payment-icon apple"> Pay</span>
          <span className="payment-icon gpay">G Pay</span>
          <span className="payment-icon jcb">JCB</span>
          <span className="payment-icon master">mastercard</span>
          <span className="payment-icon shop">shop</span>
          <span className="payment-icon visa">VISA</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>©2026 Future Studio</p>
      </div>
    </footer>
  );
};


/* =====================================================================
   5. COMPONENT GỐC (APP) LẮP RÁP TẤT CẢ
   ===================================================================== */
const App: React.FC = () => {
  return (
    <div>
      <Header />
      <Body />
      <Footer />
    </div>
  );
};

export default App;