import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
    onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const safeProgress = Math.min(100, Math.max(0, progress));

    useEffect(() => {
        const previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const interval = window.setInterval(() => {
            setProgress((currentProgress) => {
                if (currentProgress >= 100) return 100;
                const increment = Math.floor(Math.random() * 15) + 1;
                return Math.min(100, currentProgress + increment);
            });
        }, 80);

        return () => {
            window.clearInterval(interval);
            document.body.style.overflow = previousBodyOverflow;
        };
    }, []);

    useEffect(() => {
        if (progress !== 100) return;

        const completionTimeout = window.setTimeout(() => {
            onComplete();
        }, 600);

        return () => window.clearTimeout(completionTimeout);
    }, [progress, onComplete]);

    return (
        <motion.div
            className="preloader-overlay"
            exit={{ y: '-100vh', opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
            <div className="preloader-content">
                <span className="preloader-brand">Future Studio</span>
                <div className="preloader-counter">{safeProgress}%</div>
            </div>

            <div className="preloader-bar-bg">
                <div
                    className="preloader-bar-fill"
                    style={{ width: `${safeProgress}%` }}
                />
            </div>
        </motion.div>
    );
};

export default Preloader;
