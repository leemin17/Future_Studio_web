

import type { ContactLink, HeroMedia, NavItem } from './types.ts';

export type { ContactLink, HeroMedia, NavItem, NewsItem, ProductCategory, TeamMember } from './types.ts';


/* =====================================================================
   2. KHO DỮ LIỆU TÁCH RIÊNG (MOCK DATABASE)
   ===================================================================== */
// Data cho Slider (Hero)
export const heroImages: HeroMedia[] = [
  {
    type: 'vimeo',
    src: 'https://vimeo.com/1206377241',
    title: 'Helio',
    poster: 'images/helio.webp',
    productId: 3,
  },
  {
    type: 'vimeo',
    src: 'https://vimeo.com/1204790802',
    title: "BITI'S Kids Butterfly",
    poster: 'images/bitisbutterfly.webp',
    productId: 2,
  },
  {
    type: 'vimeo',
    src: 'https://vimeo.com/1204801368',
    title: "BITI'S Hunter",
    poster: 'images/bitishunter.webp',
    productId: 1,
  },
];

// Data cho Khách hàng (Our Customers!)
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

/* =====================================================================
   3. DỮ LIỆU CHO CÁC COMPONENT GIAO DIỆN
   ===================================================================== */

// Data cho Header Navigation
export const navItems: NavItem[] = [
  {
    label: 'Products',
    id: 'showcase',
    path: '/all-products',
    subItems: [
      { label: 'All', id: 'showcase-all', path: '/all-products' },
      { label: 'Cartoon 3D', id: 'showcase-cartoon-3d', path: '/cartoon-3d' },
      { label: 'TVC', id: 'showcase-tvc', path: '/tvc' },
      { label: 'Art', id: 'showcase-art', path: '/art' },
      { label: 'Showreel', id: 'showcase-showreel', path: '/showreel' },
    ]
  },
  {
    label: 'About',
    id: 'about',
    path: '/team',
    subItems: [
      { label: 'Team', id: 'about-team', path: '/team' }
    ]
  },
  { label: 'Contact', id: 'contact', path: '/contact' },
  { label: 'Login', id: 'login', path: '/admin' },
];

export const contactLinks: ContactLink[] = [
  {
    label: 'Instagram',
    value: '@futurestudio.vn',
    href: 'https://www.instagram.com/',
    icon: 'instagram',
  },
  {
    label: 'Gmail',
    value: 'futurestudio.vn@gmail.com',
    href: 'mailto:futurestudio.vn@gmail.com',
    icon: 'gmail',
  },
  {
    label: 'Facebook',
    value: 'Future Studio',
    href: 'https://www.facebook.com/Futurestudiovn?locale=vi_VN',
    icon: 'facebook',
  },
  {
    label: 'Phone',
    value: '097 177 31 34',
    href: 'tel:+840971773134',
    icon: 'phone',
  },
  {
    label: 'Office address',
    value: '91 Nghiem Xuân Yêm, Dang Nang City, Vietnam',
    href: 'https://maps.app.goo.gl/bqL3tWeV2Fs5bEsh9',
    icon: 'location',
  },
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
