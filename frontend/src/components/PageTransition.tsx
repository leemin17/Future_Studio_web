import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // Trạng thái bắt đầu: Mờ và nằm hơi thấp
      animate={{ opacity: 1, y: 0 }}  // Trạng thái hiện tại: Rõ và vào đúng vị trí
      exit={{ opacity: 0, y: -20 }}   // Trạng thái biến mất: Mờ dần và trượt lên trên
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;