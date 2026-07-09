import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
    onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Khóa cuộn trang khi đang loading
        document.body.style.overflow = 'hidden';

        const updateProgress = () => {
            setProgress((prev) => {
                // Nhảy số ngẫu nhiên từ 1 đến 15 để tạo cảm giác load thật
                const nextValue = prev + Math.floor(Math.random() * 15) + 1;
                
                if (nextValue >= 100) {
                    setTimeout(() => {
                        onComplete(); // Báo cho component cha biết đã load xong
                        document.body.style.overflow = 'auto'; // Mở lại cuộn trang
                    }, 400); // Dừng lại 0.4s ở 100% cho người dùng kịp nhìn
                    return 100;
                }
                return nextValue;
            });
        };

        // Tốc độ nhảy số (càng nhỏ càng nhanh)
        const interval = setInterval(updateProgress, 80);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <motion.div 
            className="preloader-overlay"
            // Hiệu ứng khi Preloader biến mất (trượt lên trên và mờ dần)
            exit={{ y: '-100vh', opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }} // Cubic bezier chuẩn Apple
        >
            <div className="preloader-content">
                <span className="preloader-brand">Future Studio</span>
                <div className="preloader-counter">{progress}%</div>
            </div>
            
            {/* Thanh tiến trình chạy ngang dưới đáy màn hình (Tùy chọn) */}
            <div className="preloader-bar-bg">
                <div 
                    className="preloader-bar-fill" 
                    style={{ width: `${progress}%` }} 
                />
            </div>
        </motion.div>
    );
};

export default Preloader;