import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { mvData } from '../data/database';

const MVPage: React.FC = () => {
  // Tự động cuộn lên đầu khi vào trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '100px', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Tiêu đề trang */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '16px' }}>
            FUTURE STUDIO SHOWCASE
          </span>
          <h1 style={{ fontFamily: '"Titan One", cursive', fontSize: '48px', color: 'var(--color-text-title)', letterSpacing: '2px', marginBottom: '16px' }}>
            Music Videos & Films
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-gray-medium)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Khám phá thư viện video chất lượng cao từ Future Studio. Từ những MV ca nhạc, phim ngắn cho đến các thước phim hậu trường đầy cảm hứng.
          </p>
        </div>

        {/* Lưới hiển thị Video */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '40px' }}>
          {mvData.map((mv, index) => (
            <motion.div 
              key={mv.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              style={{ backgroundColor: 'var(--color-bg-light)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
            >
              {/* Vùng chứa iframe video (Ép tỷ lệ chuẩn 16:9) */}
              <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
                <iframe 
                  src={mv.embedUrl} 
                  title={mv.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>

              {/* Thông tin văn bản dưới video */}
              <div style={{ padding: '24px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
                  {mv.date}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-title)', marginBottom: '12px', lineHeight: '1.4' }}>
                  {mv.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-gray)', lineHeight: '1.6', margin: 0 }}>
                  {mv.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MVPage;