import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { newsData, customerData, type NewsItem } from '@data/database';
import ModelViewer from '../components/ModelViewer';
import DetailPageLayout from '../components/DetailPageLayout'; // 1. Import layout chung
import RelatedPostsSidebar from '../components/RelatedPostsSidebar';
import { getAssetUrl } from '../utils/media';
import { sortByDateDesc } from '../utils/date';
import { useAppNavigation } from '../hooks/useAppNavigation';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { navigate, goToProduct } = useAppNavigation();
  const productId = parseInt(id || '0', 10);
  
  // Gộp chung data để đảm bảo click từ Product hay Customer đều tìm thấy bài
  const allContentData = [...newsData, ...customerData];
  const selectedProduct = allContentData.find(item => item.id === productId);

  // State và logic để xử lý sự kiện vuốt
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const minSwipeDistance = 100; // Khoảng cách vuốt tối thiểu để kích hoạt


  const [viewMode, setViewMode] = useState<'2D' | '3D'>('3D');

  // Logic kiểm tra xem data bài viết có chứa file 3D không
  const has3DModel = Boolean(selectedProduct && selectedProduct.modelUrl);
  // Nếu có model thì tuân theo viewMode (2D/3D), nếu không có thì ép hệ thống hiển thị 2D
  const currentView = has3DModel ? viewMode : '2D';

  const handleProductClick = (item: NewsItem) => {
    goToProduct(item.id);
  };

  if (!selectedProduct) {
    return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Sản phẩm không tồn tại.</div>;
  }

  // Xác định xem bài viết này là Product hay Customer để hiển thị nội dung và cột phải cho đúng
  const isCustomer = customerData.some(item => item.id === productId);
  const relatedData = isCustomer ? [...customerData] : [...newsData];
  
  // Sắp xếp bài viết bên cột phải
  const sortedRelatedData = sortByDateDesc(relatedData);

  // --- LOGIC XỬ LÝ VUỐT ĐỂ QUAY LẠI ---
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) {
      return;
    }
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    // Nếu vuốt từ phải sang trái đủ xa -> Quay lại trang trước
    if (distance > minSwipeDistance) {
      navigate(-1);
    }
    setTouchStart(null); // Reset lại vị trí
  };

  // 2. Tách riêng nội dung cho cột trái (main content)
  const mainContent = (
    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
      <div style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
        {/* Nút chuyển đổi View Mode */}
        {has3DModel && (
          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setViewMode('2D')}
              className="btn-black-small" 
              style={{ backgroundColor: viewMode === '2D' ? '#5ccba3' : '#111' }}
            >
              Ảnh 2D
            </button>
            <button 
              onClick={() => setViewMode('3D')}
              className="btn-black-small"
              style={{ backgroundColor: viewMode === '3D' ? '#5ccba3' : '#111' }}
            >
              Xoay 3D
            </button>
          </div>
        )}

        {/* Hiển thị Nội dung tùy theo Mode */}
        <div style={{ width: '100%', backgroundColor: '#f5f2f2', overflow: 'hidden', borderRadius: '8px', minHeight: '500px', aspectRatio: currentView === '3D' ? '1 / 1' : 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {currentView === '3D' ? (
            <ModelViewer modelUrl={selectedProduct.modelUrl} /> 
          ) : (
            selectedProduct.videoUrl ? (
              <video
                src={getAssetUrl(selectedProduct.videoUrl)}
                poster={getAssetUrl(selectedProduct.imageUrl)}
                controls
                autoPlay
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            ) : (
              <img src={getAssetUrl(selectedProduct.imageUrl)} alt={selectedProduct.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            )
          )}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: '300px' }}>
        <span style={{ fontSize: '12px', fontWeight: '800', color: '#666666', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
          {isCustomer ? `TAG: ${selectedProduct.date}` : `PUBLISHED AT: ${selectedProduct.date}`}
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1.4', marginBottom: '24px' }}>
          {selectedProduct.title}
        </h1>
        <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#444444', marginBottom: '32px' }}>
          {isCustomer ? (
            <>
              <p style={{ marginBottom: '16px' }}>
                Future Studio rất vinh dự được đồng hành cùng các đối tác và khách hàng trong dự án này. Chúng tôi luôn đặt trọn tâm huyết vào từng chi tiết thiết kế để tạo ra những sản phẩm sáng tạo, mang đậm dấu ấn thương hiệu.
              </p>
              <p>
                Cảm ơn quý khách hàng đã tin tưởng và lựa chọn Future Studio là nơi hiện thực hóa những ý tưởng của mình.
              </p>
            </>
          ) : (
            <>
              <p style={{ marginBottom: '16px' }}>
                Đây là trang hiển thị thông tin chi tiết đầy đủ của nội dung thuộc hệ thống Future Studio. Tại đây, khách hàng có thể tìm hiểu sâu hơn về nguồn gốc, câu chuyện nghệ thuật ẩn sau sản phẩm và các quy trình chế tác tỉ mỉ.
              </p>
              <p>
                Mọi chi tiết thiết kế đều được đội ngũ biên tập viên tuyển chọn kỹ càng nhằm đem lại  trải nghiệm tinh tế và độc bản nhất dành riêng cho bạn.
              </p>
            </>
          )}
        </div>
        <button className="btn-primary-black">Liên hệ Future Studio ngay</button>
      </div>
    </div>
  );

  // 3. Tách riêng nội dung cho cột phải (sidebar)
  const sidebarContent = (
    <RelatedPostsSidebar
      heading={isCustomer ? 'Khách hàng và quà tặng' : 'Bài viết mới nhất'}
      items={sortedRelatedData.filter(item => item.id !== selectedProduct.id).slice(0, 5)}
      onItemClick={handleProductClick}
    />
  );

  return (
    // 4. Sử dụng layout chung và truyền props
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <DetailPageLayout 
        mainContent={mainContent}
        sidebarContent={sidebarContent}
      />
    </div>
  );
};

export default ProductDetailPage;
