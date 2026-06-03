import React from 'react';
import { CiMenuBurger } from "react-icons/ci";

interface HeaderProps {
    onLogoClick: () => void;
    showFixedHeader: boolean;
    isAtDetailPage: boolean;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, showFixedHeader, isAtDetailPage }) => {
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

            <div className="header-nav">
                <div className="search-bar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span>Tìm kiếm</span>
                </div>
                <div className="menu-burger">
                    <CiMenuBurger size={24} />
                </div>
            </div>
        </div>
    );
};

export default Header;