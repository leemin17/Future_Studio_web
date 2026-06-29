/* =====================================================================
   1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (INTERFACES)
   ===================================================================== */
export interface NavSubItem {
  label: string;
  id: string;
  path?: string;
}

export interface NavItem {
  label: string;
  id: string;
  path?: string;
  subItems?: NavSubItem[];
}

export interface NewsItem {
  id: number;
  date: string;
  project_name: string;
  clientInformation: string;
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

export interface MvItem {
  id: number;
  title: string;
  date: string;
  embedUrl: string;
  description: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
}


/* =====================================================================
   2. KHO DỮ LIỆU TÁCH RIÊNG (MOCK DATABASE)
   ===================================================================== */
// Data cho Slider (Hero)
export const heroImages = [
  'images/bitisbutterfly.webp',
  'images/helio.webp',
  'images/bitishunter.webp',
];

// Data cho Tin tức (What's new / All Products!)
export const newsData: NewsItem[] = [
  { id: 1, date: '2026.04.26', project_name: 'project', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204801368' },
  { id: 2, date: '2024.03.26', project_name: 'project', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204790802' },
  { id: 3, date: '2026.04.05', project_name: 'project', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204801368' },
  { id: 4, date: '2024.03.18', project_name: 'project', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204790802' },
  { id: 5, date: '2024.03.10', project_name: 'project', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204801368', modelUrl: 'models/Lipstick.glb' },
  { id: 6, date: '2024.02.28', project_name: 'project', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204790802' },
  { id: 7, date: '2024.02.15', project_name: 'project', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204801368' },
  { id: 8, date: '2024.01.20', project_name: 'project', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204790802' }
];

// Data cho Khách hàng (Our Customers!)
export const customerData: NewsItem[] = [
  { id: 101, date: 'THANK YOU', project_name: 'project', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204801368' },
  { id: 102, date: 'CREATIVE', project_name: 'project', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204790802' },
  { id: 103, date: 'STUDIO', project_name: 'project', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204801368' },
  { id: 104, date: 'TRUSTED', project_name: 'project', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204801368' },
  { id: 105, date: '2026', project_name: 'project', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204801368' }
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

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Sarah & Chloe',
    role: 'Creative Duo',
    image: 'images/anhcuong.jpg'
  },
  {
    id: 2,
    name: 'Mark',
    role: 'Head of Dev',
    image: 'images/anhdat.jpg'
  },
  {
    id: 3,
    name: 'Lê Minh',
    role: 'Frontend Developer',
    image: 'images/anhcuong.jpg'
  },
  {
    id: 4,
    name: 'Anna',
    role: 'UI/UX Designer',
    image: 'images/anhdat.jpg'
  },
  {
    id: 5,
    name: 'Anna',
    role: 'UI/UX Designer',
    image: 'images/anhdat.jpg'
  },
  {
    id: 6,
    name: 'Anna',
    role: 'UI/UX Designer',
    image: 'images/anhdat.jpg'
  },
  {
    id: 7,
    name: 'Anna',
    role: 'UI/UX Designer',
    image: 'images/anhdat.jpg'
  }
];

/* =====================================================================
   3. DỮ LIỆU CHO CÁC COMPONENT GIAO DIỆN
   ===================================================================== */

// Data cho Header Navigation
export const navItems: NavItem[] = [
  {
    label: 'Showcase',
    id: 'showcase',
    subItems: [
      { label: 'All', id: 'showcase-all', path: '/all-products' },
      { label: '3D', id: 'showcase-3d' },
      { label: 'Cartoon', id: 'showcase-cartoon' }
    ]
  },
  {
    label: 'The Team',
    id: 'team',
    subItems: [
      { label: 'Members', id: 'team-members', path: '/team' }
    ]
  },
  { label: 'About', id: 'about', path: '/about' },
  { label: 'Merch', id: 'merch' },
  { label: 'Contact', id: 'contact' },
];

// Data cho trang Music Video
export const mvData: MvItem[] = [
  { id: 1, title: 'Future Studio - Bức tranh tương lai', date: '2024.04.10', embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'MV chính thức giới thiệu không gian sáng tạo của Future Studio. Khám phá những câu chuyện chưa từng được kể.' },
  { id: 2, title: 'Hậu trường sản xuất - Animation 3D', date: '2024.03.20', embedUrl: 'https://www.youtube.com/embed/tgbNymZ7vqY', description: 'Cùng xem các nghệ sĩ của chúng tôi tạo ra những thước phim 3D đỉnh cao như thế nào qua hàng ngàn giờ làm việc miệt mài.' },
  { id: 3, title: 'Sự kiện ra mắt bộ sưu tập mới', date: '2024.02.15', embedUrl: 'https://www.youtube.com/embed/y8Yv4pnO7qc', description: 'Toàn cảnh sự kiện hoành tráng ra mắt các sản phẩm giới hạn của năm cùng những vị khách mời đặc biệt.' },
  { id: 4, title: 'Phim ngắn: The Last Guardian', date: '2024.01.05', embedUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw', description: 'Một dự án phim ngắn tâm huyết do đội ngũ Future Studio thực hiện nhằm truyền tải thông điệp bảo vệ thiên nhiên.' }
];

// Data cho các từ khóa tìm kiếm gợi ý
export const popularSearches: string[] = [
  'Quà tặng',
  'Phim hoạt hình',
  'Khóa học 3D',
  'VIP',
  'Kỷ niệm',
  'Sáng tạo',
  'Tri ân',
  'Đối tác'
];
