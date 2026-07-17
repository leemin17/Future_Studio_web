

import type { ContactLink, HeroMedia, NavItem, NewsItem, ProductCategory, TeamMember } from './types.ts';

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

type QuickViewLayout = NonNullable<NewsItem['quickViewLayout']>;

const quickVideoLayout = (...urls: string[]): QuickViewLayout =>
  urls.map((url) => ({
    type: 'full',
    items: [{ kind: 'video', url }],
  }));

const quickGalleryLayout = (
  columns: 1 | 2 | 3 | 4,
  imageUrls: string[],
  videoUrls: string[] = []
): QuickViewLayout => [
  ...(imageUrls.length
    ? [{
        type: 'grid' as const,
        columns,
        items: imageUrls.map((url) => ({ kind: 'image' as const, url })),
      }]
    : []),
  ...videoUrls.map((url) => ({
    type: 'full' as const,
    items: [{ kind: 'video' as const, url }],
  })),
];

// Data cho Tin tức (What's new / All Products!)
export const newsData: NewsItem[] = [
  { id: 1, date: '2026.04.26', title: 'BITI\'S HUNTER X QUANG HÙNG 2K TVC', clientInformation: 'BITI\'S', describe: 'Description for BITI\'S HUNTER X QUANG HÙNG 2K TVC', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204801368', videoGallery: ['https://vimeo.com/1204801368'], quickViewLayout: quickGalleryLayout(2, [''], ['https://vimeo.com/1204801368']) },
  { id: 2, date: '2024.03.26', title: 'BITI\'S KIDS BUTTERFLY', clientInformation: 'BITI\'S', describe: 'Description for BITI\'S KIDS BUTTERFLY', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1204790802', quickViewLayout: quickVideoLayout('https://vimeo.com/1204790802') },
  { id: 3, date: '2026.04.05', title: 'CHÍNH THỨC RA MẮT HELIO BY BITI\'S', clientInformation: 'BITI\'S', describe: 'Description for CHÍNH THỨC RA MẮT HELIO BY BITI\'S', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1206377241', quickViewLayout: quickVideoLayout('https://vimeo.com/1206377241') },
  { id: 4, date: '2024.03.18', title: 'HUY THANH x SOOBIN - SOOBIN\'S QUEEN COLLECTION', clientInformation: 'HUY THANH', describe: 'Description for HUY THANH x SOOBIN - SOOBIN\'S QUEEN COLLECTION', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208125419', quickViewLayout: quickVideoLayout('https://vimeo.com/1208125419') },
  { id: 6, date: '2024.02.28', title: 'HOVAZ CHU DU KÝ', clientInformation: 'client', describe: 'Description for HOVAZ CHU DU KÝ', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208129419', quickViewLayout: quickVideoLayout('https://vimeo.com/1208129419') },
  { id: 7, date: '2024.02.15', title: 'Nhạc thiếu nhi AKOOLAND', clientInformation: 'THIEN LONG', describe: 'Description for Nhạc thiếu nhi AKOOLAND', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208131264', quickViewLayout: quickVideoLayout('https://vimeo.com/1208131264') },
  { id: 8, date: '2024.01.20', title: 'VƯƠNG QUỐC GIÀY tập 1', clientInformation: 'BITI\'S', describe: 'Description for VƯƠNG QUỐC GIÀY tập 1', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208150552', quickViewLayout: quickVideoLayout('https://youtu.be/_q-QgAcUtdU?si=mcfa01QhOVi3UFWQ') },
  { id: 9, date: '2024.01.20', title: 'VƯƠNG QUỐC GIÀY tập 2', clientInformation: 'BITI\'S', describe: 'Description for VƯƠNG QUỐC GIÀY tập 2', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208152403', quickViewLayout: quickVideoLayout('https://youtu.be/9xTWZ_wu3Ts?si=RKinC8hhUA5dlYmn') },
  { id: 10, date: '2024.01.20', title: 'VƯƠNG QUỐC GIÀY tập 3', clientInformation: 'BITI\'S', describe: 'Description for VƯƠNG QUỐC GIÀY tập 3', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208153783', quickViewLayout: quickVideoLayout('https://youtu.be/XGTcW6suw9c?si=RFB3GT4xjGOX5D6l') },
  { id: 11, date: '2024.01.20', title: 'VƯƠNG QUỐC GIÀY tập 4', clientInformation: 'BITI\'S', describe: 'Description for VƯƠNG QUỐC GIÀY tập 4', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208154874', quickViewLayout: quickVideoLayout('https://youtu.be/L_ElBFhRzi8?si=iQO12cbLm4onkUMz') },
  { id: 12, date: '2024.01.20', title: 'VƯƠNG QUỐC GIÀY tập 5', clientInformation: 'BITI\'S', describe: 'Description for VƯƠNG QUỐC GIÀY tập 5', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208157311', quickViewLayout: quickVideoLayout('https://youtu.be/Pxdx1buchs4?si=kMj23k6BWF0ixtui')},
  { id: 13, date: '2024.02.15', title: 'VPBANK MARATHON MOTION', clientInformation: 'VPBANK', describe: 'Description for VPBANK MARATHON MOTION', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208134719', quickViewLayout: quickVideoLayout('https://vimeo.com/1208134719') },
  { id: 14, date: '2024.02.15', title: 'HUNTER VELOCITY', clientInformation: 'BITI\'S', describe: 'Description for HUNTER VELOCITY', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208122932', quickViewLayout: quickVideoLayout('https://vimeo.com/1208122932') },
  { id: 15, date: '2024.02.15', title: 'MÙA HÈ MỘNG MƠ', clientInformation: 'BITI\'S', describe: 'Description for MÙA HÈ MỘNG MƠ', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208307630', quickViewLayout: quickVideoLayout('https://youtu.be/f9mTTEAL3zg?si=nDyD7u_FexUFN6Mu') },
  { id: 16, date: '2024.02.15', title: 'ELLE', clientInformation: 'ELLE', describe: 'Description for ELLE', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208324489', quickViewLayout: quickVideoLayout('https://vimeo.com/1208324489') },
  { id: 17, date: '2024.02.15', title: 'TH true milk', clientInformation: 'TH TRUE MILK', describe: 'Description for TH true milk', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208325217', videoGallery: ['https://vimeo.com/1208327469', 'https://vimeo.com/1208329980', 'https://vimeo.com/1208333202'], quickViewLayout: quickVideoLayout('https://vimeo.com/1208325217', 'https://vimeo.com/1208327469', 'https://vimeo.com/1208329980', 'https://vimeo.com/1208333202') },
  { id: 18, date: '2024.02.15', title: 'Dự án cầu Bình Lợi', clientInformation: '_', describe: 'Description for Dự án cầu Bình Lợi', imageUrl: 'images/logo_text.png', videoUrl: 'https://vimeo.com/1208326945', quickViewLayout: quickVideoLayout('https://vimeo.com/1208326945') },
  {
    id: 19,
    date: '2024.02.15',
    title: 'Air Asia',
    clientInformation: 'AIR ASIA',
    describe: 'Description for air asia',
    imageUrl: 'images/AIR ASIA/FINAL COMP.png',
    quickViewLayout: [
      {
        type: 'grid',
        columns: 3,
        items: [
          { kind: 'image', url: 'images/AIR ASIA/ELEMENTS 1.png' },
          { kind: 'image', url: 'images/AIR ASIA/ELEMENTS 2.png' },
          { kind: 'image', url: 'images/AIR ASIA/ELEMENTS 3.png' },
        ],
      },
      {
        type: 'full',
        items: [
          { kind: 'image', url: 'images/AIR ASIA/FINAL COMP.png' },
        ],
      },
    ],
  }
];

/* =====================================================================
   PHÂN LOẠI SẢN PHẨM: CARTOON 3D / CTV / ART
   Chuyển ID giữa ba mảng dưới đây để thay đổi nhóm của sản phẩm.
   ===================================================================== */
export const productCategoryIds: Record<ProductCategory, number[]> = {
  'cartoon-3d': [ 8, 9, 10, 11, 12, 15],
  tvc: [1, 2, 3, 4, 6, 7, 13, 14, 16, 17, 18],
  art: [19],
  showreel: []
};

const productsByCategory = (category: ProductCategory): NewsItem[] =>
  newsData
    .filter((item) => productCategoryIds[category].includes(item.id))
    .map((item) => ({ ...item, category }));

export const cartoon3DData = productsByCategory('cartoon-3d');
export const tvcData = productsByCategory('tvc');
export const artData = productsByCategory('art');
export const showreelData = productsByCategory('showreel');

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

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Trần Tiến Đạt",
    role: "BOSS & Founder",
    image: "images/anhdat.jpg",
    color: "rgba(255, 255, 255, 0.15)", 
    bio: "Thiết kế không chỉ là tạo ra cái đẹp, mà là nghệ thuật kể câu chuyện của thương hiệu bằng ngôn ngữ thị giác.",
    socials: { github: "#", linkedin: "#" }
  },
  {
    id: 2,
    name: "Lê Chí Cường",
    role: "3D Artist",
    image: "images/anhcuong.jpg",
    color: " rgba(255, 255, 255, 0.15)", 
    bio: "Đưa ý tưởng của bạn bước ra ngoài mặt giấy.",
    socials: { behance: "#", dribbble: "#" }
  },
  {
    id: 3,
    name: "Trà My",
    role: "Lighting Artist",
    image: "images/anhdat.jpg",
    color: "rgba(255, 255, 255, 0.15)",
    bio: "Nơi ánh sáng làm chủ khung hình và bóng tối kể những câu chuyện bí ẩn.",
    socials: { behance: "#", dribbble: "#" }
  },
  {
    id: 4,
    name: "Thiều Sinh Tuấn",
    role: "2D Artist",
    image: "images/anhcuong.jpg",
    color: "rgba(255, 255, 255, 0.15)",
    bio: "Kiến tạo những thế giới mới trên mặt phẳng 2D.",
    socials: { behance: "#", dribbble: "#" }
  },
  {
    id: 5,
    name: "Nguyễn Hà Vi",
    role: "2D Artist",
    image: "images/anhcuong.jpg",
    color: "rgba(255, 255, 255, 0.15)",
    bio: "Sáng tạo không giới hạn. Vẽ nên mọi ý tưởng.",
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
