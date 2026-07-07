import { motion } from 'framer-motion';

const MottoSection = () => {
    return (
        <section className="motto-section">
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