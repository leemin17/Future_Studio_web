import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

// Dữ liệu mẫu cho các MV (Anh có thể tách ra file database.ts sau này)
const mvData = [
  {
    id: 1,
    title: 'Future Studio - Bức tranh tương lai',
    date: '2024.04.10',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Link youtube nhúng
    description: 'MV chính thức giới thiệu không gian sáng tạo của Future Studio. Khám phá những câu chuyện chưa từng được kể.'
  },
  {
    id: 2,
    title: 'Hậu trường sản xuất - Animation 3D',
    date: '2024.03.20',
    embedUrl: 'https://www.youtube.com/embed/tgbNymZ7vqY', 
    description: 'Cùng xem các nghệ sĩ của chúng tôi tạo ra những thước phim 3D đỉnh cao như thế nào qua hàng ngàn giờ làm việc miệt mài.'
  },
  {
    id: 3,
    title: 'Sự kiện ra mắt bộ sưu tập mới',
    date: '2024.02.15',
    embedUrl: 'https://www.youtube.com/embed/y8Yv4pnO7qc',
    description: 'Toàn cảnh sự kiện hoành tráng ra mắt các sản phẩm giới hạn của năm cùng những vị khách mời đặc biệt.'
  },
  {
    id: 4,
    title: 'Phim ngắn: The Last Guardian',
    date: '2024.01.05',
    embedUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
    description: 'Một dự án phim ngắn tâm huyết do đội ngũ Future Studio thực hiện nhằm truyền tải thông điệp bảo vệ thiên nhiên.'
  }
];

const MVPage: React.FC = () => {
  // Tự động cuộn lên đầu khi vào trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '100px', minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <div className="container">
        
        {/* Tiêu đề trang */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.15em', color: '#666', display: 'block', marginBottom: '16px' }}>
            FUTURE STUDIO SHOWCASE
          </span>
          <h1 style={{ fontFamily: '"Titan One", cursive', fontSize: '48px', color: '#111', letterSpacing: '2px', marginBottom: '16px' }}>
            Music Videos & Films
          </h1>
          <p style={{ fontSize: '15px', color: '#444', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
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
              style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
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
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#888', display: 'block', marginBottom: '8px' }}>
                  {mv.date}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111', marginBottom: '12px', lineHeight: '1.4' }}>
                  {mv.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', margin: 0 }}>
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