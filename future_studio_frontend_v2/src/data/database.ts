/* =====================================================================
   1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (INTERFACES)
   ===================================================================== */
export interface NewsItem {
  id: number;
  date: string;
  title: string;
  imageUrl: string;
  videoUrl?: string; // Thêm đường dẫn cho video (tùy chọn)
  modelUrl?: string; // Thêm đường dẫn cho mô hình 3D (tùy chọn)
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
  'images/anhdep.jpg',
  'images/FINAL_COMP.png',
  'images/video.gif',
];

// Data cho Tin tức (What's new / All Products!)
export const newsData: NewsItem[] = [
  { id: 1, date: '2026.04.26', title: 'Future Studio thông báo chính thức nghỉ lễ từ 26/4 đến 3/5', imageUrl: 'images/nghile.jpg' },
  { id: 2, date: '2024.03.26', title: 'Quà cưới cũng là quà tặng cho "chú rể" tốt nhất', imageUrl: 'images/logo.jpg' },
  { id: 3, date: '2026.04.05', title: 'future team tuyển dụng thành viên cho team', imageUrl: 'images/video.gif' },
  { id: 4, date: '2024.03.18', title: 'Nhìn! Future Studio GOD 👑 Giới thiệu hàng hóa dành riêng...', imageUrl: 'images/video.gif' },
  { id: 5, date: '2024.03.10', title: 'Dự án phim hoạt hình mới chính thức bấm máy.', imageUrl: 'images/jobiterview.jpg',modelUrl: 'models/Lipstick.glb' },
  { id: 6, date: '2024.02.28', title: 'Khai giảng khóa học 3D Animation cơ bản.', imageUrl: 'images/jobiterview.jpg' },
  { id: 7, date: '2024.02.15', title: 'Tham quan Studio: Hậu trường phía sau những thước phim.', imageUrl: 'images/jobiterview.jpg' },
  { id: 8, date: '2024.01.20', title: 'Future Studio lọt top studio sáng tạo của năm!', imageUrl: 'images/jobiterview.jpg' }
];

// Data cho Khách hàng (Our Customers!)
export const customerData: NewsItem[] = [
  { id: 101, date: 'THANK YOU', title: 'Dự án quà tặng kỷ niệm ngày thành lập tập đoàn đối tác', imageUrl: 'images/logo.jpg' },
  { id: 102, date: 'CREATIVE', title: 'Bộ quà tặng sáng tạo độc quyền thiết kế riêng cho khách hàng VIP', imageUrl: 'images/black_text_logo.png' },
  { id: 103, date: 'STUDIO', title: 'Đơn hàng 500 set quà bàn giao thành công cho studio nghệ thuật', imageUrl: 'images/jobiterview.jpg' },
  { id: 104, date: 'TRUSTED', title: 'Hợp tác sản xuất hộp quà cao cấp cùng thương hiệu Local Brand', imageUrl: 'images/logo.jpg' },
  { id: 105, date: '2026', title: 'Sự kiện tri ân các khách hàng thân thiết đồng hành cùng Future Studio', imageUrl: 'images/jobiterview.jpg' }
];
export const heroDetails = [
  {
    subtitle: 'FUTURE STUDIO — CHIẾN DỊCH 01',
    title: 'Khám phá Bộ sưu tập Mới: Giao Thoa Nghệ Thuật',
    description1: 'Chiến dịch đầu tiên mang đến cái nhìn sâu sắc về sự kết hợp giữa nghệ thuật truyền thống và công nghệ 3D hiện đại.',
    description2: 'Mỗi chi tiết đều được đội ngũ của chúng tôi chăm chút tỉ mỉ để tạo ra trải nghiệm thị giác đột phá, định hình lại ranh giới của sự sáng tạo.'
  },
  {
    subtitle: 'FUTURE STUDIO — DỰ ÁN 02',
    title: 'Hậu trường Đằng sau những Thước phim Hoạt hình',
    description1: 'Cùng Future Studio bước vào thế giới đằng sau ống kính, nơi những nhân vật hoạt hình 3D sống động được tạo ra từ hàng ngàn giờ làm việc miệt mài.',
    description2: 'Tìm hiểu quy trình từ kịch bản, thiết kế nhân vật đến rigging và animation qua góc nhìn của các nghệ sĩ dày dạn kinh nghiệm.'
  },
  {
    subtitle: 'FUTURE STUDIO — SỰ KIỆN 03',
    title: 'Tri ân Khách hàng & Ra mắt Sản phẩm Giới hạn',
    description1: 'Đánh dấu chặng đường phát triển, Future Studio tổ chức sự kiện đặc biệt để gửi lời cảm ơn sâu sắc tới những người đã luôn đồng hành.',
    description2: 'Nhiều phần quà hấp dẫn cùng dòng sản phẩm giới hạn được chế tác độc quyền sẽ chính thức lộ diện. Hãy là những người đầu tiên sở hữu!'
  }
];
