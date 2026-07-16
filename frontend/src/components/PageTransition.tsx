import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const dragState = React.useRef({
    active: false,
    pointerId: -1,
    startY: 0,
    startScrollY: 0,
    moved: false,
  });
  const blockClick = React.useRef(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (
      window.innerWidth > 768 ||
      event.pointerType !== 'mouse' ||
      event.button !== 0 ||
      target.closest('.hero-frame')
    ) return;

    dragState.current = {
      active: true,
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollY: window.scrollY,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    if (!state.active || state.pointerId !== event.pointerId) return;

    const distance = event.clientY - state.startY;
    if (Math.abs(distance) > 5) state.moved = true;
    if (!state.moved) return;

    event.preventDefault();
    window.scrollTo({ top: state.startScrollY - distance, behavior: 'auto' });
  };

  const finishPointerDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    if (!state.active || state.pointerId !== event.pointerId) return;

    blockClick.current = state.moved;
    dragState.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    window.setTimeout(() => {
      blockClick.current = false;
    }, 0);
  };

  return (
    <motion.div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerDrag}
      onPointerCancel={finishPointerDrag}
      onClickCapture={(event) => {
        if (!blockClick.current) return;
        event.preventDefault();
        event.stopPropagation();
      }}
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
