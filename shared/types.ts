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

export interface ContactLink {
  label: string;
  value: string;
  href: string;
  icon: 'instagram' | 'gmail' | 'facebook' | 'phone' | 'location';
}

export type ProductCategory = 'cartoon-3d' | 'tvc' | 'art' | 'showreel';

export interface QuickViewItem {
  kind?: 'image' | 'video' | 'text' | 'embed' | 'model';
  url?: string;
  content?: string;
  html?: string;
  caption?: string;
  textStyle?: QuickViewTextStyle;
}

export interface QuickViewTextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 400 | 600 | 700 | 800;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  width?: 50 | 75 | 100;
}

export interface QuickViewLayoutBlock {
  type: 'grid' | 'full' | 'text' | 'embed' | 'model';
  columns?: 1 | 2 | 3 | 4;
  items: QuickViewItem[];
}

export interface NewsItem {
  id: number;
  date: string;
  title: string;
  clientInformation: string;
  describe: string;
  imageUrl: string;
  partnerLogoUrl?: string;
  category?: ProductCategory;
  videoUrl?: string;
  modelUrl?: string;
  imageGallery?: string[];
  videoGallery?: string[];
  quickViewLayout?: QuickViewLayoutBlock[];
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

export interface HeroMedia {
  type: 'image' | 'vimeo';
  src: string;
  title: string;
  poster?: string;
  productId: number;
}

export interface HeroDetail {
  subtitle: string;
  title: string;
  description1: string;
  description2: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  color: string;
  bio: string;
  socials?: Record<string, string>;
  skills?: { name: string; level: number }[];
}
