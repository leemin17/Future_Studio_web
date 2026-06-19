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
  const [isLoading, setIsLoading] = useState(false);

  // Danh sách các từ khóa gợi ý
  const popularSearches = ['Quà tặng', 'Phim hoạt hình', 'Khóa học 3D', 'VIP', 'Kỷ niệm', 'Sáng tạo', 'Tri ân', 'Đối tác'];

  // Lọc kết quả mỗi khi người dùng gõ
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Dùng setTimeout (debounce) để tạo độ trễ 500ms trước khi lọc, tạo cảm giác đang tải dữ liệu
    const delaySearch = setTimeout(() => {
      // Lọc theo từ khóa và sắp xếp theo ngày mới nhất
      const filteredResults = allSearchableData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
      ).sort((a, b) => {
        return new Date(b.date.replace(/\./g, '-')).getTime() - new Date(a.date.replace(/\./g, '-')).getTime();
      });
      setResults(filteredResults);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [query]);

  // Khóa cuộn trang khi mở overlay
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Đóng overlay khi bấm phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Đóng overlay khi người dùng nhấp vào một kết quả
  const handleResultClick = () => {
    onClose();
  };

  return (
    <div 
      className="search-overlay" 
      onClick={(e) => {
        // Chỉ đóng khi click trực tiếp vào nền overlay, bỏ qua các click bên trong content
        if (e.target === e.currentTarget) onClose();
      }}
    >
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
        {query.trim() === '' && (
          <div className="search-suggestions">
            <h4 className="search-suggestion-title">Gợi ý tìm kiếm</h4>
            <div className="search-suggestion-tags">
              {popularSearches.map((term, idx) => (
                <button
                  key={idx}
                  className="search-suggestion-tag"
                  onClick={() => setQuery(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="search-overlay-results">
          {query.trim() !== '' && isLoading && (
            <div className="search-loading-container">
              <div className="search-spinner"></div>
            </div>
          )}
          {query.trim() !== '' && !isLoading && results.length === 0 && (
            <p className="search-no-results">Không tìm thấy kết quả nào.</p>
          )}
          {!isLoading && results.map((item, index) => (
            <Link
              to={`/product/${item.id}`}
              key={`${item.type}-${item.id}`}
              className="search-result-item"
              onClick={handleResultClick}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <img src={`${import.meta.env.BASE_URL}${item.imageUrl}`} alt={item.title} className="search-result-image" />
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