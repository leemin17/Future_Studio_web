import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="main-footer">
            <div className="footer-container">
                <div className="footer-logo-block">
                    <h2 className="footer-logo">Future Studio</h2>
                </div>
                <nav className="footer-primary-nav">
                    <a href="#1">Tìm quà</a><a href="#2">Future là gì?</a><a href="#3">Cách cho và nhận</a>
                </nav>
            </div>
            <div className="footer-bottom"><p>©2026 Future Studio</p></div>
        </footer>
    );
};

export default Footer;