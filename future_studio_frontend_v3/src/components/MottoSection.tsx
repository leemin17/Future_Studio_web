import React from 'react';
import { motion } from 'framer-motion';

const MottoSection = () => {
    return (
        <section className="motto-section">
            
            {/* LỰA CHỌN 1: Bỏ comment đoạn này nếu thích nền Tờ giấy cổ điển */}
            {/* 
            <motion.div 
                className="motto-paper"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="motto-text">
                    "Sự xuất sắc không phải là một hành động, nó là một thói quen. Chúng tôi kiến tạo tương lai bằng những bước đi vững chắc của ngày hôm nay."
                </h2>
                <p className="motto-author">Tên Công Ty</p>
            </motion.div>
            */}

            {/* LỰA CHỌN 2: Phong cách Typography hiện đại trên nền tối */}
            <motion.div 
                className="motto-modern"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: "easeOut" }}
            >
                <h2 className="motto-text">
                    "Đổi mới không ngừng, <span className="motto-highlight">bứt phá</span> mọi giới hạn để mang lại giá trị thực cho tương lai."
                </h2>
                <p className="motto-author">Tên Công Ty Của Bạn</p>
            </motion.div>

        </section>
    );
};

export default MottoSection;