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
  title: string;
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
  color: string;
  bio: string;
  socials: { github?: string; linkedin?: string; behance?: string; dribbble?: string };
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
  { id: 1, date: '2026.04.26', title: '"BITI\'S HUNTER X QUANG HÙNG 2K TVC"', clientInformation: 'BITI\'S', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204801368' },
  { id: 2, date: '2024.03.26', title: 'BITI\'S KIDS BUTTERFLY', clientInformation: 'BITI\'S', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204790802' },
  { id: 3, date: '2026.04.05', title: 'CHÍNH THỨC RA MẮT HELIO BY BITI\'S', clientInformation: 'BITI\'S', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1206377241' },
  { id: 4, date: '2024.03.18', title: 'HUY THANH x SOOBIN - SOOBIN\'S QUEEN COLLECTION', clientInformation: 'HUY THANH', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208125419' },
  { id: 9, date: '2024.03.10', title: 'project', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204801368', modelUrl: 'models/Lipstick.glb' },
  { id: 6, date: '2024.02.28', title: 'HOVAZ CHU DU KÝ', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208129419' },
  { id: 7, date: '2024.02.15', title: 'Nhạc thiếu nhi AKOOLAND', clientInformation: 'THIEN LONG', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208131264' },
  { id: 8, date: '2024.01.20', title: 'VƯƠNG QUỐC GIÀY tập 1', clientInformation: 'BITI\'S', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208150552' },
  { id: 9, date: '2024.01.20', title: 'VƯƠNG QUỐC GIÀY tập 2', clientInformation: 'BITI\'S', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208152403' },
  { id: 10, date: '2024.01.20', title: 'VƯƠNG QUỐC GIÀY tập 3', clientInformation: 'BITI\'S', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208153783' },
  { id: 11, date: '2024.01.20', title: 'VƯƠNG QUỐC GIÀY tập 4', clientInformation: 'BITI\'S', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208154874' },
  { id: 12, date: '2024.01.20', title: 'VƯƠNG QUỐC GIÀY tập 5', clientInformation: 'BITI\'S', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208157311' },
  { id: 13, date: '2024.02.15', title: 'VPBANK MARATHON MOTION', clientInformation: 'VPBANK', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208134719' },
  { id: 14, date: '2024.02.15', title: 'HUNTER VELOCITY', clientInformation: 'BITI\'S', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208122932' },
  { id: 15, date: '2024.02.15', title: 'Nhạc thiếu nhi AKOOLAND', clientInformation: 'THIEN LONG', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208131264' },

];

// Data cho Khách hàng (Our Customers!)
export const customerData: NewsItem[] = [
  { id: 101, date: '2024.01.20', title: 'THANK YOU', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204801368' },
  { id: 103, date: '2024.01.20', title: 'STUDIO', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204801368' },
  { id: 105, date: '2024.01.20', title: '2026', clientInformation: 'client', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204801368' }
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
        name: "Lê Minh",
        role: "AI & Computer Vision Engineer",
        image: "images/anhdat.jpg",
        color: "rgba(255, 255, 255, 0.15)", // Màu Mint (Xanh ngọc) mờ
        bio: "Đam mê khám phá các giới hạn của Deep Learning. Hiện đang tập trung phát triển các mô hình Computer Vision hiệu suất cao ứng dụng kiến trúc YOLOv8 và tối ưu hóa hệ thống nhận diện theo thời gian thực tại Đà Nẵng.",
        socials: { github: "#", linkedin: "#" }
    },
    {
        id: 2,
        name: "Sarah & Chloe",
        role: "Creative Duo",
        image: "images/anhcuong.jpg",
        color: " rgba(255, 255, 255, 0.15)", // Màu Cam mờ
        bio: "Bộ đôi sáng tạo đứng đằng sau các concept thị giác đột phá. Chuyên trị các chiến dịch Branding và thiết kế giao diện UI/UX với phong cách tối giản nhưng đầy quyền lực.",
        socials: { behance: "#", dribbble: "#" }
    },
    {
        id: 3,
        name: "Sarah & Chloe",
        role: "Creative Duo",
        image: "images/anhdat.jpg",
        color: "rgba(255, 255, 255, 0.15)", // Màu Mint (Xanh ngọc) mờ
        bio: "Bộ đôi sáng tạo đứng đằng sau các concept thị giác đột phá. Chuyên trị các chiến dịch Branding và thiết kế giao diện UI/UX với phong cách tối giản nhưng đầy quyền lực.",
        socials: { behance: "#", dribbble: "#" }
    },
    {
        id: 4,
        name: "Sarah & Chloe",
        role: "Creative Duo",
        image: "images/anhcuong.jpg",
        color: "rgba(255, 255, 255, 0.15)", // Màu Cam mờ
        bio: "Bộ đôi sáng tạo đứng đằng sau các concept thị giác đột phá. Chuyên trị các chiến dịch Branding và thiết kế giao diện UI/UX với phong cách tối giản nhưng đầy quyền lực.",
        socials: { behance: "#", dribbble: "#" }
    },
];

/* =====================================================================
   3. DỮ LIỆU CHO CÁC COMPONENT GIAO DIỆN
   ===================================================================== */

// Data cho Header Navigation
export const navItems: NavItem[] = [
  {
    label: 'Products',
    id: 'showcase',
    subItems: [
      { label: 'All', id: 'showcase-all', path: '/all-products' }
    ]
  },
  {
    label: 'About',
    id: 'about',
    subItems: [
      { label: 'Team', id: 'about-team', path: '/team' }
    ]
  },
  { label: 'Contact', id: 'contact' },
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
