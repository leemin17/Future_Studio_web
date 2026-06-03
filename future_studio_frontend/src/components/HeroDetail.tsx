import React from 'react';

interface HeroDetailProps {
    heroIndex: number;
    onBack: () => void;
}

const HeroDetail: React.FC<HeroDetailProps> = ({ heroIndex, onBack }) => {
    return (
        <section className="container" style={{ paddingTop: '60px', paddingBottom: '100px' }}>
            <button onClick={onBack} className="btn-arrow" style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto', padding: '0 16px', borderRadius: '8px' }}>
                ← Quay lại trang chủ
            </button>

            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#666666', display: 'block', marginBottom: '8px', letterSpacing: '0.1em' }}>
                        FUTURE STUDIO — HERO EVENT #{heroIndex + 1}
                    </span>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1.4', marginBottom: '24px', color: '#111111' }}>
                        Chi tiết chiến dịch cốt truyện & Bộ sưu tập độc quyền {heroIndex + 1}
                    </h1>
                    <p style={{ color: '#444', lineHeight: '1.8' }}>
                        Chào mừng bạn đến với trang thông tin chi tiết sự kiện của Future Studio được lấy trực tiếp từ banner quảng cáo chính.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default HeroDetail;