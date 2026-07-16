import React from 'react';
import type { NewsItem } from '@shared/types';
import { getAssetUrl } from '../utils/media';

interface RelatedPostsSidebarProps {
  heading: string;
  items: NewsItem[];
  onItemClick: (item: NewsItem) => void;
  // Cho phép tùy biến nhãn hiển thị của mỗi mục (mặc định là tiêu đề bài viết).
  getItemLabel?: (item: NewsItem) => React.ReactNode;
}

// Cột "bài viết liên quan" dùng chung cho các trang chi tiết (Product/Hero/About).
const RelatedPostsSidebar: React.FC<RelatedPostsSidebarProps> = ({
  heading,
  items,
  onItemClick,
  getItemLabel = (item) => item.title,
}) => {
  return (
    <div style={{ width: '320px', flexGrow: 0, flexShrink: 0, backgroundColor: '#fafafa', padding: '24px', borderRadius: '12px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '24px', color: '#111111' }}>
        {heading}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {items.map((item) => (
          <div key={item.id} onClick={() => onItemClick(item)} style={{ display: 'flex', gap: '16px', cursor: 'pointer', alignItems: 'center' }}>
            <div style={{ width: '72px', height: '72px', flexShrink: 0, backgroundColor: '#eaeaea', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={getAssetUrl(item.imageUrl)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#888', fontWeight: '700', marginBottom: '4px', display: 'block' }}>{item.date}</span>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#111111', lineHeight: '1.4', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {getItemLabel(item)}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedPostsSidebar;
