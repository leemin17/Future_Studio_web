import React, { useState, useEffect } from 'react';

// 🔥 DÒNG MỚI THÊM: Kết nối và lấy thẳng dữ liệu từ kho lưu trữ riêng
import { heroImages, newsData, type NewsItem } from './data/database';
import Header from './components/Header.tsx';
import HeroSlider from './components/HeroSlider.tsx';
import Body from './components/Body.tsx';
import Footer from './components/Footer.tsx';

/* =====================================================================
   5. COMPONENT GỐC (APP) LẮP RÁP VÀ TRUYỀN BIẾN TRẠNG THÁI TRANG
   ===================================================================== */
const App: React.FC = () => {
  const [selectedHeroIndex, setSelectedHeroIndex] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<NewsItem | null>(null);
  const [showFixedHeader, setShowFixedHeader] = useState(false);

  // Theo dõi thanh cuộn cho Header khi ở trang chủ
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

  const handleResetHome = () => {
    setSelectedHeroIndex(null);
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroClick = (index: number) => {
    setSelectedHeroIndex(index);
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (item: NewsItem) => {
    setSelectedProduct(item);
    setSelectedHeroIndex(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Biến kiểm tra xem có đang ở trang phụ (trang chi tiết) hay không
  const isAtDetailPage = selectedHeroIndex !== null || selectedProduct !== null;

  return (
    <div>
      {/* Truyền trạng thái trang isAtDetailPage vào Header */}
      <Header
        onLogoClick={handleResetHome}
        showFixedHeader={showFixedHeader}
        isAtDetailPage={isAtDetailPage}
      />

      {/* Chỉ khi ở Trang Chủ mới hiện Hero Container */}
      {!isAtDetailPage && <HeroSlider onHeroClick={handleHeroClick} />}

      {/* Trang phụ chi tiết Chiến dịch Hero */}
      {selectedHeroIndex !== null && (
        <section className="container" style={{ paddingTop: '60px', paddingBottom: '100px' }}>
          <button
            onClick={handleResetHome}
            className="btn-arrow"
            style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto', padding: '0 16px', borderRadius: '8px' }}
          >
            ← Quay lại trang chủ
          </button>

          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* CỘT TRÁI: Nội dung chính */}
            <div style={{ flex: '1 1 calc(100% - 360px)', minWidth: '320px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
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

            {/* CỘT PHẢI: Bài viết khác bên cạnh */}
            <div style={{ width: '320px', flexGrow: 0, flexShrink: 0, backgroundColor: '#fafafa', padding: '24px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '24px', color: '#111111' }}>
                Khám phá thêm
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {newsData.slice(0, 4).map((item) => (
                  <div key={item.id} onClick={() => handleProductClick(item)} style={{ display: 'flex', gap: '16px', cursor: 'pointer', alignItems: 'center' }}>
                    <div style={{ width: '72px', height: '72px', flexShrink: 0, backgroundColor: '#eaeaea', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#888', fontWeight: '700', marginBottom: '4px', display: 'block' }}>{item.date}</span>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#111111', lineHeight: '1.4', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trang phụ chi tiết Sản phẩm */}
      {selectedProduct !== null && (
        <section className="container" style={{ paddingTop: '60px', paddingBottom: '100px' }}>
          <button
            onClick={handleResetHome}
            className="btn-arrow"
            style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto', padding: '0 16px' }}
          >
            ← Quay lại trang chủ
          </button>

          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* CỘT TRÁI: Nội dung chính */}
            <div style={{ flex: '1 1 calc(100% - 360px)', minWidth: '320px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
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

            {/* CỘT PHẢI: Bài viết khác bên cạnh */}
            <div style={{ width: '320px', flexGrow: 0, flexShrink: 0, backgroundColor: '#fafafa', padding: '24px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '24px', color: '#111111' }}>
                Bài viết mới nhất
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {newsData.filter(item => item.id !== selectedProduct.id).slice(0, 5).map((item) => (
                  <div key={item.id} onClick={() => handleProductClick(item)} style={{ display: 'flex', gap: '16px', cursor: 'pointer', alignItems: 'center' }}>
                    <div style={{ width: '72px', height: '72px', flexShrink: 0, backgroundColor: '#eaeaea', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#888', fontWeight: '700', marginBottom: '4px', display: 'block' }}>{item.date}</span>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#111111', lineHeight: '1.4', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Nếu không ở trang nào thì hiện Body trang chủ như bình thường */}
      {!selectedHeroIndex && !selectedProduct && <Body onSelectProduct={handleProductClick} />}

      <Footer />
    </div>
  );
};

export default App;