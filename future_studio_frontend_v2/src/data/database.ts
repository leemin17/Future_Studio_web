/* =====================================================================
   1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (INTERFACES)
   ===================================================================== */
export interface NewsItem {
  id: number;
  date: string;
  title: string;
  imageUrl: string;
}

export interface ProductItem {
  id: number;
  tag: string;
  title: string;
  highlightTag?: string;
  price?: string;
  description?: string;
  imageUrl: string;
}

/* =====================================================================
   2. KHO DỮ LIỆU TÁCH RIÊNG (MOCK DATABASE)
   ===================================================================== */
// Data cho Slider (Hero)
export const heroImages = [
  'images/_mainvisual-001.png',
  'images/FINAL_COMP.png',
  'images/_mainvisual-001.png',
];

// Data cho Tin tức (What's new / All Products!)
export const newsData: NewsItem[] = [
  { id: 1, date: '2024.04.05', title: 'future team tuyển dụng thành viên cho team', imageUrl: 'images/black_text_logo.png' },
  { id: 2, date: '2024.03.26', title: 'Quà cưới cũng là quà tặng cho "chú rể" tốt nhất', imageUrl: 'images/logo.jpg' },
  { id: 3, date: '2024.04.09', title: 'Mọi người dùng nó như thế nào? Cách người dùng có th...', imageUrl: 'images/jobiterview.jpg' },
  { id: 4, date: '2024.03.18', title: 'Nhìn! Future Studio GOD 👑 Giới thiệu hàng hóa dành riêng...', imageUrl: 'images/jobiterview.jpg' },
  { id: 5, date: '2024.03.10', title: 'Dự án phim hoạt hình mới chính thức bấm máy.', imageUrl: 'images/jobiterview.jpg' },
  { id: 6, date: '2024.02.28', title: 'Khai giảng khóa học 3D Animation cơ bản.', imageUrl: 'images/jobiterview.jpg' },
  { id: 7, date: '2024.02.15', title: 'Tham quan Studio: Hậu trường phía sau những thước phim.', imageUrl: 'images/jobiterview.jpg' },
  { id: 8, date: '2024.01.20', title: 'Future Studio lọt top studio sáng tạo của năm!', imageUrl: 'images/jobiterview.jpg' }
];

// Data cho Khách hàng (Our Customers!)
export const customerData: NewsItem[] = [
  { id: 1, date: 'THANK YOU', title: 'Dự án quà tặng kỷ niệm ngày thành lập tập đoàn đối tác', imageUrl: 'images/logo.jpg' },
  { id: 2, date: 'CREATIVE', title: 'Bộ quà tặng sáng tạo độc quyền thiết kế riêng cho khách hàng VIP', imageUrl: 'images/black_text_logo.png' },
  { id: 3, date: 'STUDIO', title: 'Đơn hàng 500 set quà bàn giao thành công cho studio nghệ thuật', imageUrl: 'images/jobiterview.jpg' },
  { id: 4, date: 'TRUSTED', title: 'Hợp tác sản xuất hộp quà cao cấp cùng thương hiệu Local Brand', imageUrl: 'images/logo.jpg' },
  { id: 5, date: '2026', title: 'Sự kiện tri ân các khách hàng thân thiết đồng hành cùng Future Studio', imageUrl: 'images/jobiterview.jpg' }
];
