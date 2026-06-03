import React, { useState, useEffect } from 'react';
import { type NewsItem } from '../data/database';

interface HomeProps {
    onSelectProduct: (item: NewsItem) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectProduct }) => {
    const [newsList, setNewsList] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/news')
            .then((res) => {
                if (!res.ok) throw new Error('Không thể fetch dữ liệu');
                return res.json();
            })
            .then((data) => {
                setNewsList(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Lỗi:", err);
                setLoading(false);
            });
    }, []);

    const [currentNewsPage, setCurrentNewsPage] = useState(1);
    const itemsPerPage = 4;
    const totalNewsPages = Math.ceil(newsList.length / itemsPerPage) || 1;
    const currentNews = newsList.slice((currentNewsPage - 1) * itemsPerPage, currentNewsPage * itemsPerPage);

    const handlePrevNews = () => { if (currentNewsPage > 1) setCurrentNewsPage(currentNewsPage - 1); };
    const handleNextNews = () => { if (currentNewsPage < totalNewsPages) setCurrentNewsPage(currentNewsPage + 1); };

    useEffect(() => {
        if (loading) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.2 });

        const elements = document.querySelectorAll('.scroll-reveal');
        elements.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [loading]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '16px', color: '#666' }}>
                🔄 Đang kết nối server backend và tải sản phẩm...
            </div>
        );
    }

    return (
        <main>
            <section className="container">
                <div className="section-header scroll-reveal">
                    <span className="section-subtitle">A GIFT WITH A STORY</span>
                    <h2 className="section-title">All Products!</h2>
                    <p className="section-desc">Các sản phẩm nổi bật & mới nhất</p>
                </div>

                {newsList.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999' }}>Chưa có sản phẩm nào trong file dữ liệu JSON.</p>
                ) : (
                    <div className="news-grid">
                        {currentNews.map((item) => (
                            <div key={item.id} className="news-card" onClick={() => onSelectProduct(item)} style={{ cursor: 'pointer' }}>
                                <div className="news-sidebar">
                                    <span className="vertical-date">{item.date}</span>
                                </div>
                                <div className="news-content">
                                    <div className="news-image">
                                        <img src={item.imageUrl} alt={item.title} />
                                    </div>
                                    <p className="news-text">{item.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="carousel-controls">
                    <button className="btn-arrow" onClick={handlePrevNews} disabled={currentNewsPage === 1} style={{ opacity: currentNewsPage === 1 ? 0.3 : 1 }}>←</button>
                    <span className="carousel-page">{String(currentNewsPage).padStart(2, '0')} — {String(totalNewsPages).padStart(2, '0')}</span>
                    <button className="btn-arrow" onClick={handleNextNews} disabled={currentNewsPage === totalNewsPages} style={{ opacity: currentNewsPage === totalNewsPages ? 0.3 : 1 }}>→</button>
                </div>
            </section>
        </main>
    );
};

export default Home;