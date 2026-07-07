import React, { useState, useEffect } from 'react';
import { useLenis } from 'lenis/react';
import { useNavigate } from 'react-router-dom';

import { navItems } from '../data/database';

interface HeaderProps {
  onLogoClick: () => void;
  showFixedHeader: boolean;
  isAtDetailPage: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
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

const sectionIds = navItems.map((item) => item.id);

const Header: React.FC<HeaderProps> = ({ onLogoClick, showFixedHeader, isAtDetailPage, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const activeSection = useScrollSpy(sectionIds);
  const lenis = useLenis();
  const navigate = useNavigate();

  const handleScrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    if (lenis) {
      if (isAtDetailPage) {
        navigate('/');
        setTimeout(() => lenis.scrollTo(`#${id}`, { offset: 0, duration: 1.2 }), 100);
      }
      lenis.scrollTo(`#${id}`, { offset: 0, duration: 1.2 });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

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

      <nav className={`header-center-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {navItems.map((item) => (
          <div key={item.id} className={`nav-item-wrapper ${item.id}`}>
            <button
              className={`header-nav-link ${!isAtDetailPage && activeSection === item.id ? 'active' : ''}`}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  if (isAtDetailPage) {
                    navigate(`/#${item.id}`);
                  } else {
                    handleScrollTo(item.id);
                  }
                }
              }}
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
                      setIsMobileMenuOpen(false);
                      if (sub.path) {
                        navigate(sub.path);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        if (isAtDetailPage) {
                          navigate(`/#${sub.id}`);
                        } else {
                          handleScrollTo(sub.id);
                        }
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
    </div >
  );
};

export default Header;
