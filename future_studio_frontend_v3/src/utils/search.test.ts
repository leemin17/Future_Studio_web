import { describe, it, expect } from 'vitest';
import {
  parseDotDate,
  buildSearchableData,
  searchItems,
  type SearchableItem,
} from './search';
import { type NewsItem } from '../data/database';

const makeItem = (id: number, title: string, date: string): NewsItem => ({
  id,
  title,
  date,
  clientInformation: 'client',
  imageUrl: 'images/x.png',
});

describe('parseDotDate', () => {
  it('chuyển yyyy.mm.dd thành timestamp hợp lệ', () => {
    expect(parseDotDate('2024.03.26')).toBe(new Date('2024-03-26').getTime());
  });

  it('ngày mới hơn có timestamp lớn hơn', () => {
    expect(parseDotDate('2026.04.26')).toBeGreaterThan(parseDotDate('2024.01.20'));
  });

  it('chuỗi không phải ngày trả về NaN', () => {
    expect(Number.isNaN(parseDotDate('THANK YOU'))).toBe(true);
  });
});

describe('buildSearchableData', () => {
  const news = [makeItem(1, 'Alpha', '2024.01.01')];
  const customers = [makeItem(2, 'Beta', '2024.02.02')];

  it('gộp cả hai danh sách', () => {
    expect(buildSearchableData(news, customers)).toHaveLength(2);
  });

  it('gắn type product cho tin tức và customer cho khách hàng', () => {
    const result = buildSearchableData(news, customers);
    expect(result[0].type).toBe('product');
    expect(result[1].type).toBe('customer');
  });

  it('giữ nguyên các trường gốc của item', () => {
    const [first] = buildSearchableData(news, []);
    expect(first).toMatchObject({ id: 1, title: 'Alpha', imageUrl: 'images/x.png' });
  });
});

describe('searchItems', () => {
  const data: SearchableItem[] = buildSearchableData(
    [
      makeItem(1, 'Future Gift Box', '2024.01.10'),
      makeItem(2, 'Animation Course', '2026.05.01'),
      makeItem(3, 'gift wrapping', '2025.03.03'),
    ],
    [],
  );

  it('lọc theo từ khóa không phân biệt hoa/thường', () => {
    const result = searchItems(data, 'GIFT');
    expect(result.map((r) => r.id).sort()).toEqual([1, 3]);
  });

  it('sắp xếp kết quả theo ngày mới nhất trước', () => {
    const result = searchItems(data, 'gift');
    expect(result[0].id).toBe(3); // 2025 mới hơn 2024
  });

  it('trả về mảng rỗng khi query rỗng hoặc chỉ có khoảng trắng', () => {
    expect(searchItems(data, '')).toEqual([]);
    expect(searchItems(data, '   ')).toEqual([]);
  });

  it('trả về mảng rỗng khi không có kết quả khớp', () => {
    expect(searchItems(data, 'khong-ton-tai')).toEqual([]);
  });

  it('không làm thay đổi mảng gốc (không mutate)', () => {
    const snapshot = [...data];
    searchItems(data, 'gift');
    expect(data).toEqual(snapshot);
  });
});
