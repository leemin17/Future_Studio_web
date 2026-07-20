import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applySeoMetadata } from '../utils/seo';

const routeMetadata: Record<string, { title: string; description: string }> = {
  '/': { title: 'Future Studio Vietnam | CGI, 3D Animation & Creative Production', description: 'Future Studio Vietnam chuyên sản xuất TVC, CGI, hoạt hình 3D, mascot và nội dung hình ảnh sáng tạo dành cho thương hiệu.' },
  '/all-products': { title: 'Dự án sáng tạo | Future Studio Vietnam', description: 'Khám phá portfolio TVC, CGI, hoạt hình 3D, showreel và các dự án sáng tạo của Future Studio Vietnam.' },
  '/tvc': { title: 'TVC Production | Future Studio Vietnam', description: 'Các dự án TVC và phim quảng cáo được thực hiện bởi Future Studio Vietnam.' },
  '/cartoon-3d': { title: 'Cartoon & 3D Animation | Future Studio Vietnam', description: 'Khám phá các dự án hoạt hình, CGI và 3D Animation của Future Studio Vietnam.' },
  '/art': { title: 'Art Projects | Future Studio Vietnam', description: 'Tổng hợp các dự án nghệ thuật và hình ảnh sáng tạo của Future Studio Vietnam.' },
  '/showreel': { title: 'Showreel | Future Studio Vietnam', description: 'Showreel tuyển chọn những dự án và năng lực sản xuất nổi bật của Future Studio Vietnam.' },
  '/team': { title: 'Đội ngũ | Future Studio Vietnam', description: 'Gặp gỡ đội ngũ nghệ sĩ, nhà thiết kế và chuyên gia sản xuất sáng tạo tại Future Studio Vietnam.' },
  '/contact': { title: 'Liên hệ | Future Studio Vietnam', description: 'Liên hệ Future Studio Vietnam để trao đổi về TVC, CGI, hoạt hình 3D, mascot và dự án sáng tạo.' },
  '/admin': { title: 'Admin | Future Studio Vietnam', description: 'Khu vực quản trị nội dung Future Studio Vietnam.' },
};

const RouteMetadata = () => {
  const location = useLocation();

  useEffect(() => {
    const metadata = routeMetadata[location.pathname] ?? { title: 'Project | Future Studio Vietnam', description: 'Dự án sáng tạo được thực hiện bởi Future Studio Vietnam.' };
    applySeoMetadata({ ...metadata, path: location.pathname, robots: location.pathname === '/admin' ? 'noindex, nofollow' : 'index, follow, max-image-preview:large' });
  }, [location.pathname]);

  return null;
};

export default RouteMetadata;
