import React, { useState, useEffect } from 'react';
import { useLenis } from 'lenis/react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onLogoClick: () => void;
  showFixedHeader: boolean;
  isAtDetailPage: boolean;
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
      // Thêm path: '/product/1' để khi bấm vào sẽ chuyển sang trang chi tiết sản phẩm 1
      { label: 'All', id: 'showcase-all', path: '/product/2' },
      { label: '3D', id: 'showcase-3d' },
      { label: 'Cartoon', id: 'showcase-cartoon' },
      { label: 'Video Music', id: 'showcase-music' }
    ]
  },
  { label: 'The Team', 
    id: 'team',  
    subItems: [
      { label: 'Members', id: 'team-members' },
      { label: 'Careers', id: 'team-careers' }
    ]
  },
  { label: 'About', id: 'about' },
  { label: 'Merch', id: 'merch' },
  { label: 'Contact', id: 'contact' },
];

const sectionIds = navItems.map((item) => item.id);

const Header: React.FC<HeaderProps> = ({ onLogoClick, showFixedHeader, isAtDetailPage }) => {
  const activeSection = useScrollSpy(sectionIds);
  const lenis = useLenis(); // Khởi tạo Lenis để dùng cho việc cuộn
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Khóa cuộn trang (body) khi đang mở menu trên điện thoại
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const handleScrollTo = (id: string) => {
    setIsMobileMenuOpen(false); // Đóng menu mobile khi người dùng đã chọn mục
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

      <div className="header-logo" onClick={onLogoClick} style={{ cursor: 'pointer' }}>
        Future Studio
      </div>

      {/* Nút Hamburger menu dành cho điện thoại */}
      {!isAtDetailPage && (
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      )}

      {/* Thanh Menu điều hướng nằm giữa */}
      {!isAtDetailPage && (
        <nav className={`header-center-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {navItems.map((item) => (
            <div key={item.id} className={`nav-item-wrapper ${item.id}`}>
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
                      onClick={() => {
                        setIsMobileMenuOpen(false); // Đóng menu mobile sau khi chuyển trang
                        if (sub.path) {
                          // Nếu có thuộc tính path -> Chuyển trang
                          navigate(sub.path);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          // Ngược lại -> Trượt mượt xuống section
                          handleScrollTo(sub.id);
                        }
                      }}
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
