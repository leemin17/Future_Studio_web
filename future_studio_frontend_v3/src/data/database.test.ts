import { describe, it, expect } from 'vitest';
import {
  heroImages,
  newsData,
  customerData,
  teamMembers,
  mvData,
  navItems,
  popularSearches,
  type NewsItem,
} from './database';

const uniqueIds = (items: { id: number }[]): boolean =>
  new Set(items.map((i) => i.id)).size === items.length;

const assertNewsShape = (item: NewsItem) => {
  expect(typeof item.id).toBe('number');
  expect(item.title.length).toBeGreaterThan(0);
  expect(item.date.length).toBeGreaterThan(0);
  expect(item.clientInformation.length).toBeGreaterThan(0);
  expect(item.imageUrl.length).toBeGreaterThan(0);
};

describe('heroImages', () => {
  it('không rỗng và mọi phần tử là đường dẫn ảnh không rỗng', () => {
    expect(heroImages.length).toBeGreaterThan(0);
    heroImages.forEach((src) => expect(src.length).toBeGreaterThan(0));
  });
});

describe('newsData', () => {
  it('không rỗng', () => {
    expect(newsData.length).toBeGreaterThan(0);
  });

  it('id là duy nhất', () => {
    expect(uniqueIds(newsData)).toBe(true);
  });

  it('mọi mục có đủ trường bắt buộc', () => {
    newsData.forEach(assertNewsShape);
  });

  it('nếu có videoUrl thì phải là URL hợp lệ', () => {
    newsData
      .filter((i) => i.videoUrl)
      .forEach((i) => expect(i.videoUrl).toMatch(/^https?:\/\//));
  });
});

describe('customerData', () => {
  it('id là duy nhất', () => {
    expect(uniqueIds(customerData)).toBe(true);
  });

  it('mọi mục có đủ trường bắt buộc', () => {
    customerData.forEach(assertNewsShape);
  });

  it('id không trùng với newsData (để key tìm kiếm gộp không đụng nhau)', () => {
    const newsIds = new Set(newsData.map((i) => i.id));
    const overlap = customerData.filter((c) => newsIds.has(c.id));
    expect(overlap).toEqual([]);
  });
});

describe('teamMembers', () => {
  it('id là duy nhất và mọi thành viên có name/role/image', () => {
    expect(uniqueIds(teamMembers)).toBe(true);
    teamMembers.forEach((m) => {
      expect(m.name.length).toBeGreaterThan(0);
      expect(m.role.length).toBeGreaterThan(0);
      expect(m.image.length).toBeGreaterThan(0);
    });
  });
});

describe('mvData', () => {
  it('id là duy nhất', () => {
    expect(uniqueIds(mvData)).toBe(true);
  });

  it('mọi embedUrl là URL nhúng hợp lệ', () => {
    mvData.forEach((mv) => expect(mv.embedUrl).toMatch(/^https?:\/\//));
  });
});

describe('navItems', () => {
  it('có ít nhất một mục điều hướng', () => {
    expect(navItems.length).toBeGreaterThan(0);
  });

  it('mỗi subItem có link path thì phải bắt đầu bằng /', () => {
    navItems
      .flatMap((n) => n.subItems ?? [])
      .filter((s) => s.path)
      .forEach((s) => expect(s.path).toMatch(/^\//));
  });

  it('id của các mục cấp cao là duy nhất', () => {
    const ids = navItems.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('popularSearches', () => {
  it('là danh sách từ khóa không rỗng, không trùng lặp', () => {
    expect(popularSearches.length).toBeGreaterThan(0);
    expect(new Set(popularSearches).size).toBe(popularSearches.length);
  });
});
