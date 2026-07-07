import React from 'react';
import { newsData, type NewsItem } from '../data/database';
import RelatedPostsSidebar from '../components/RelatedPostsSidebar';
import { getAssetUrl } from '../utils/media';
import { sortByDateDesc } from '../utils/date';
import { useAppNavigation } from '../hooks/useAppNavigation';

const AboutPage: React.FC = () => {
  const { goHome, goToProduct } = useAppNavigation();

  const handleResetHome = () => {
    goHome();
  };

  const handleProductClick = (item: NewsItem) => {
    goToProduct(item.id);
  };

  // Sắp xếp bài viết bên cột phải theo ngày mới nhất
  const sortedNewsData = sortByDateDesc(newsData);

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
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#f5f5f5', overflow: 'hidden', borderRadius: '8px' }}>
            <img src={getAssetUrl('images/_mainvisual-001.png')} alt="Về Future Studio" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#666666', display: 'block', marginBottom: '8px', letterSpacing: '0.1em' }}>
              ABOUT US — FUTURE STUDIO
            </span>
            <h1 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1.4', marginBottom: '24px', color: '#111111' }}>
              Định hình lại ranh giới của sự sáng tạo
            </h1>
            <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#444444', marginBottom: '32px' }}>
              <p style={{ marginBottom: '16px' }}>
                Được thành lập với tầm nhìn tiên phong, <strong>Future Studio</strong> kết hợp sức mạnh của trí tuệ nhân tạo (AI) và nghệ thuật đồ họa 3D để biến những ý tưởng điên rồ nhất thành hiện thực.
              </p>
              <p style={{ marginBottom: '16px' }}>
                Chúng tôi không chỉ là một studio thiết kế, chúng tôi là phòng lab của những giấc mơ số, nơi mỗi pixel đều mang một câu chuyện và mọi khung hình đều chứa đựng sự đổi mới.
              </p>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111', marginTop: '24px', marginBottom: '12px' }}>Dịch vụ của chúng tôi:</h3>
              <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}><strong>3D Animation & VFX:</strong> Sản xuất phim hoạt hình, kỹ xảo hình ảnh chất lượng điện ảnh.</li>
                <li style={{ marginBottom: '8px' }}><strong>AI-Driven Creation:</strong> Ứng dụng mô hình ngôn ngữ và Generative AI để tạo ra artwork đột phá.</li>
                <li><strong>Web & Interactive:</strong> Phát triển nền tảng web tương tác cao, trải nghiệm VR và 3D.</li>
              </ul>
            </div>
            <button className="btn-primary-black" onClick={handleResetHome}>Khám phá Sản phẩm</button>
          </div>
        </div>

        {/* CỘT PHẢI: Bài viết khác bên cạnh */}
        <RelatedPostsSidebar
          heading="Bài viết mới nhất"
          items={sortedNewsData.slice(0, 5)}
          onItemClick={handleProductClick}
          getItemLabel={(item) => `${item.title} - ${item.clientInformation}`}
        />
      </div>
    </section>
  );
};

export default AboutPage;