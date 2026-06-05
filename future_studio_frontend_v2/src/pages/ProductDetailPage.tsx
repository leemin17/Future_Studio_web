import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { newsData, type NewsItem } from '../data/database';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = parseInt(id || '0', 10);
  
  const selectedProduct = newsData.find(item => item.id === productId);

  const handleResetHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (item: NewsItem) => {
    navigate(`/product/${item.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!selectedProduct) {
    return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Sản phẩm không tồn tại.</div>;
  }

  // Sắp xếp bài viết bên cột phải theo ngày mới nhất
  const sortedNewsData = [...newsData].sort((a, b) => {
    return new Date(b.date.replace(/\./g, '-')).getTime() - new Date(a.date.replace(/\./g, '-')).getTime();
  });

  return (
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
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
            {selectedProduct.videoUrl ? (
              <video
                src={`/${selectedProduct.videoUrl}`}
                poster={`/${selectedProduct.imageUrl}`}
                controls
                autoPlay
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            ) : (
              <img src={`/${selectedProduct.imageUrl}`} alt={selectedProduct.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            )}
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
          {sortedNewsData.filter(item => item.id !== selectedProduct.id).slice(0, 5).map((item) => (
              <div key={item.id} onClick={() => handleProductClick(item)} style={{ display: 'flex', gap: '16px', cursor: 'pointer', alignItems: 'center' }}>
                <div style={{ width: '72px', height: '72px', flexShrink: 0, backgroundColor: '#eaeaea', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={`/${item.imageUrl}`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
  );
};

export default ProductDetailPage;