import React from 'react';
import { useParams } from 'react-router-dom';
import { heroImages, newsData, heroDetails, type NewsItem } from '../data/database';
import RelatedPostsSidebar from '../components/RelatedPostsSidebar';
import { getAssetUrl } from '../utils/media';
import { sortByDateDesc } from '../utils/date';
import { useAppNavigation } from '../hooks/useAppNavigation';

const HeroDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { goToProduct } = useAppNavigation();
  const selectedHeroIndex = parseInt(id || '0', 10);

  const handleProductClick = (item: NewsItem) => {
    goToProduct(item.id);
  };

  if (isNaN(selectedHeroIndex) || selectedHeroIndex < 0 || selectedHeroIndex >= heroImages.length) {
    return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Chiến dịch không tồn tại.</div>;
  }

  // Lấy dữ liệu nội dung tương ứng với ảnh hoặc mặc định nếu vượt số lượng
  const detailContent = heroDetails[selectedHeroIndex] || heroDetails[0];

  // Sắp xếp bài viết bên cột phải theo ngày mới nhất
  const sortedNewsData = sortByDateDesc(newsData);

  return (
    <section className="container" style={{ paddingTop: '60px', paddingBottom: '100px' }}>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* CỘT TRÁI: Nội dung chính */}
        <div style={{ flex: '1 1 calc(100% - 360px)', minWidth: '320px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#f5f5f5', overflow: 'hidden', borderRadius: '8px' }}>
            <img src={getAssetUrl(heroImages[selectedHeroIndex])} alt={`Banner event ${selectedHeroIndex + 1}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>

          <div style={{ flex: 1, minWidth: '300px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#666666', display: 'block', marginBottom: '8px', letterSpacing: '0.1em' }}>
              {detailContent.subtitle}
            </span>
            <h1 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1.4', marginBottom: '24px', color: '#111111' }}>
              {detailContent.title}
            </h1>
            <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#444444', marginBottom: '32px' }}>
              <p style={{ marginBottom: '16px' }}>
                {detailContent.description1}
              </p>
              <p>
                {detailContent.description2}
              </p>
            </div>
            <button className="btn-primary-black">Tham gia sự kiện ngay</button>
          </div>
        </div>

        {/* CỘT PHẢI: Bài viết khác bên cạnh */}
        <RelatedPostsSidebar
          heading="Khám phá thêm"
          items={sortedNewsData.slice(0, 4)}
          onItemClick={handleProductClick}
        />
      </div>
    </section>
  );
};

export default HeroDetailPage;