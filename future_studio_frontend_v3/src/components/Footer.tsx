import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-logo-block">
          <h2 className="footer-logo">Future Studio</h2>
        </div>
        <div className="footer-socials">
          <a href="#x" className="social-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
          </a>
          <a href="#line" className="social-icon icon-line">LINE</a>
          <a href="https://www.facebook.com/Futurestudiovn" className="social-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
        </div>
        <nav className="footer-primary-nav">
          <a href="#1">Tìm quà</a>
          <Link to="/about" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Future là gì?
          </Link>
          <a href="#3">Cách cho và nhận</a>
          <a href="#4">Đăng nhập/đăng ký thành viên mới</a>
        </nav>
        <div className="footer-secondary-links">
          <a href="#faq">Những câu hỏi thường gặp</a><span className="separator">|</span><a href="#contact">Liên hệ</a><span className="separator">|</span><a href="#review">Đăng đánh giá</a><span className="separator">|</span><a href="#b2b">Dịch vụ doanh nghiệp</a><span className="separator">|</span><a href="#privacy">Chính sách bảo mật</a><span className="separator">|</span><a href="#terms">Điều khoản sử dụng</a><span className="separator">|</span><a href="#company">Công ty quản lý</a><span className="separator">|</span><a href="#legal">Mô tả dựa trên Luật Giao dịch thương mại cụ thể</a>
        </div>
        <div className="footer-payments">
          <span className="payment-icon amex">AMEX</span><span className="payment-icon apple"> Pay</span><span className="payment-icon gpay">G Pay</span><span className="payment-icon jcb">JCB</span><span className="payment-icon master">mastercard</span><span className="payment-icon shop">shop</span><span className="payment-icon visa">VISA</span>
        </div>
      </div>
      <div className="footer-bottom"><p>©2026 Future Studio</p></div>
    </footer>
  );
};

export default Footer;
