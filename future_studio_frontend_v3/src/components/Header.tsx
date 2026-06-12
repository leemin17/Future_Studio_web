import React, { useState, useEffect } from 'react';
import { useLenis } from 'lenis/react';

interface HeaderProps {
  onLogoClick: () => void;
  showFixedHeader: boolean;
  isAtDetailPage: boolean;
  onSearchClick?: () => void;
}

const useScrollSpy = (sectionIds: string[]) => {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-10% 0px -40% 0px', 
      threshold: 0.4,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, options);

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeSection;
};

const navItems = [
  { 
    label: 'Showcase', 
    id: 'showcase',
    subItems: [
      { label: 'All', id: 'showcase-all' },
      { label: '3D', id: 'showcase-3d' },
      { label: 'Cartoon', id: 'showcase-cartoon' },
      { label: 'Video Music', id: 'showcase-music' }
    ]
  },
  { label: 'The Team', id: 'team' },
  { label: 'Our Story', id: 'story' },
  { label: 'Goods', id: 'goods' },
  { label: 'Contact', id: 'contact' },
];

const Header: React.FC<HeaderProps> = ({ onLogoClick, showFixedHeader, isAtDetailPage, onSearchClick }) => {
  const sectionIds = navItems.map((item) => item.id);
  const activeSection = useScrollSpy(sectionIds);
  const lenis = useLenis(); // Khởi tạo Lenis để dùng cho việc cuộn

  const handleScrollTo = (id: string) => {
    if (lenis) {
      // Sử dụng sức mạnh của Lenis để trượt mượt mà theo gia tốc
      lenis.scrollTo(`#${id}`, { offset: 0, duration: 1.2 });
    } else {
      // Fallback dự phòng nếu Lenis chưa sẵn sàng
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Xác định class CSS dựa trên vị trí cuộn và trang hiện tại
  const headerClass = showFixedHeader
    ? 'fixed-active'
    : isAtDetailPage
      ? 'sub-page-header'
      : 'home-page-header';

  return (
    <div className={`main-header ${headerClass}`}>
      {/* Khối nhân vật chạy ẩn phía sau */}
      {/* <div className="running-character-container">
        <div className="running-character"></div>
      </div> */}

      <div className="header-logo" onClick={onLogoClick} style={{ cursor: 'pointer' }}>
        Future Studio
      </div>

      {/* Thanh Menu điều hướng nằm giữa */}
      {!isAtDetailPage && (
        <nav className="header-center-menu">
          {navItems.map((item) => (
            <div key={item.id} className="nav-item-wrapper">
              <button
                className={`header-nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => handleScrollTo(item.id)}
              >
                {item.label}
              </button>
              
              {item.subItems && (
                <div className="dropdown-menu">
                  {item.subItems.map((sub) => (
                    <button
                      key={sub.id}
                      className="dropdown-item"
                      onClick={() => handleScrollTo(sub.id)}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}
    </div>
  );
};

export default Header;
