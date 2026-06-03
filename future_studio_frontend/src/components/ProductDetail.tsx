import React from 'react';
import { type NewsItem } from '../data/database';

interface ProductDetailProps {
    product: NewsItem;
    onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
    return (
        <section className="container" style={{ paddingTop: '60px', paddingBottom: '100px' }}>
            <button onClick={onBack} className="btn-arrow" style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto', padding: '0 16px' }}>
                ← Quay lại trang chủ
            </button>

            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#f5f5f5', overflow: 'hidden', borderRadius: '4px' }}>
                    <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#666666', display: 'block', marginBottom: '8px' }}>
                        PUBLISHED AT: {product.date}
                    </span>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1.4', marginBottom: '24px' }}>
                        {product.title}
                    </h1>
                    <p style={{ color: '#444', lineHeight: '1.8', marginBottom: '24px' }}>
                        Đây là trang hiển thị chi tiết sản phẩm của hệ thống Future Studio kết nối động trực tiếp với cơ sở dữ liệu từ Backend JSON.
                    </p>
                    <button className="btn-primary-black">Liên hệ Future Studio ngay</button>
                </div>
            </div>
        </section>
    );
};

export default ProductDetail;