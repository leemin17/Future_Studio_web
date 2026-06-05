import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { newsData, customerData, type NewsItem } from '../data/database';

interface SearchOverlayProps {
  onClose: () => void;
}

// Gộp chung dữ liệu có thể tìm kiếm từ tin tức và khách hàng
const allSearchableData: (NewsItem & { type: 'product' | 'customer' })[] = [
  ...newsData.map(item => ({ ...item, type: 'product' as const })),
  ...customerData.map(item => ({ ...item, type: 'customer' as const }))
];

const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof allSearchableData>([]);

  // Lọc kết quả mỗi khi người dùng gõ
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    // Lọc theo từ khóa và sắp xếp theo ngày mới nhất
    const filteredResults = allSearchableData.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => {
      return new Date(b.date.replace(/\./g, '-')).getTime() - new Date(a.date.replace(/\./g, '-')).getTime();
    });
    setResults(filteredResults);
  }, [query]);

  // Đóng overlay khi người dùng nhấp vào một kết quả
  const handleResultClick = () => {
    onClose();
  };

  return (
    <div className="search-overlay">
      <button className="search-overlay-close" onClick={onClose}>×</button>
      <div className="search-overlay-content">
        <input
          type="text"
          className="search-overlay-input"
          placeholder="Tìm kiếm sản phẩm, tin tức..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="search-overlay-results">
          {query.trim() !== '' && results.length === 0 && (
            <p className="search-no-results">Không tìm thấy kết quả nào.</p>
          )}
          {results.map(item => (
            <Link
              to={`/product/${item.id}`}
              key={`${item.type}-${item.id}`}
              className="search-result-item"
              onClick={handleResultClick}
            >
              <img src={`/${item.imageUrl}`} alt={item.title} className="search-result-image" />
              <div className="search-result-info">
                <span className="search-result-type">{item.type === 'product' ? 'Sản phẩm/Tin tức' : 'Khách hàng'}</span>
                <h4 className="search-result-title">{item.title}</h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;