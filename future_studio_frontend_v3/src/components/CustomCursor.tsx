import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
    // State nhận diện thiết bị cảm ứng
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    // TỐI ƯU HIỆU NĂNG: Dùng useMotionValue thay cho useState 
    // Tránh việc React render lại component hàng nghìn lần gây giật lag
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Cấu hình vật lý cho lò xo để ảnh bám theo mượt mà
    const springConfig = { damping: 35, stiffness: 700, mass: 0.1};
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        // Nhận diện chuẩn xác màn hình cảm ứng (điện thoại, iPad)
        // Nếu là cảm ứng -> đánh dấu true và thoát ra luôn
        if (window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window) {
            setIsTouchDevice(true);
            return;
        }

        const updateMousePosition = (e: MouseEvent) => {
            // Cập nhật tọa độ trực tiếp vào DOM, bỏ qua React Render
            cursorX.set(e.clientX - 40); 
            cursorY.set(e.clientY - 40);
        };

        window.addEventListener('mousemove', updateMousePosition);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
        };
    }, [cursorX, cursorY]);

    // Nếu người dùng đang xài màn hình cảm ứng -> Ẩn luôn ảnh logo
    if (isTouchDevice) return null;

    return (
        <motion.img
            src="images/logo_text.png" 
            alt="cursor"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '80px', 
                height: '80px',
                pointerEvents: 'none', 
                zIndex: 999999,
                mixBlendMode: 'difference',
                // Nối trực tiếp toạ độ với style
                x: cursorXSpring,
                y: cursorYSpring,
            }}
        />
    );
};

export default CustomCursor;