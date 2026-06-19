import React from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({ children, className = '', style }) => {
  return (
    <motion.div
      className={className}
      style={style}
      // Trạng thái ban đầu: Nằm dưới, thu nhỏ một chút và nghiêng -5 độ
      initial={{ opacity: 0, y: 60, scale: 0.8, rotate: -5 }}
      // Trạng thái khi cuộn chuột tới: Hiện rõ, nảy lên và trở về góc thẳng
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ 
        type: "spring",
        stiffness: 120,  // Độ căng lò xo
        damping: 10,     // Độ cản lò xo (thấp sẽ nảy nhiều hơn)
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;