import { type NewsItem } from '../data/database';

/* =====================================================================
   TIỆN ÍCH TÌM KIẾM
   Logic lọc & sắp xếp kết quả tìm kiếm, tách khỏi component SearchOverlay
   để có thể kiểm thử độc lập.
   ===================================================================== */

export type SearchType = 'product' | 'customer';

export type SearchableItem = NewsItem & { type: SearchType };

// Chuyển chuỗi ngày dạng 'YYYY.MM.DD' thành timestamp (ms) để so sánh/sắp xếp.
// Với các chuỗi không phải ngày (vd 'THANK YOU') sẽ trả về NaN.
export const parseDotDate = (date: string): number =>
  new Date(date.replace(/\./g, '-')).getTime();

// Gộp dữ liệu tin tức và khách hàng thành một danh sách có thể tìm kiếm,
// gắn thêm trường `type` cho mỗi mục.
export const buildSearchableData = (
  news: NewsItem[],
  customers: NewsItem[],
): SearchableItem[] => [
  ...news.map((item) => ({ ...item, type: 'product' as const })),
  ...customers.map((item) => ({ ...item, type: 'customer' as const })),
];

// Lọc theo từ khóa (không phân biệt hoa/thường) rồi sắp xếp theo ngày mới nhất.
// Chuỗi rỗng/khoảng trắng trả về danh sách rỗng.
export const searchItems = <T extends { title: string; date: string }>(
  data: T[],
  query: string,
): T[] => {
  const normalized = query.trim().toLowerCase();
  if (normalized === '') return [];

  return data
    .filter((item) => item.title.toLowerCase().includes(normalized))
    .sort((a, b) => parseDotDate(b.date) - parseDotDate(a.date));
};
