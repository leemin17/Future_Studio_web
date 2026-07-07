import { describe, it, expect } from 'vitest';
import {
  getTotalPages,
  getPageItems,
  formatPageNumber,
  getPrevPage,
  getNextPage,
} from './pagination';

describe('getTotalPages', () => {
  it('chia hết thì ra đúng số trang', () => {
    expect(getTotalPages(10, 5)).toBe(2);
  });

  it('làm tròn lên khi còn dư', () => {
    expect(getTotalPages(11, 5)).toBe(3);
    expect(getTotalPages(1, 5)).toBe(1);
  });

  it('0 phần tử thì 0 trang', () => {
    expect(getTotalPages(0, 5)).toBe(0);
  });

  it('itemsPerPage <= 0 trả về 0 (tránh chia cho 0)', () => {
    expect(getTotalPages(10, 0)).toBe(0);
    expect(getTotalPages(10, -3)).toBe(0);
  });
});

describe('getPageItems', () => {
  const items = [1, 2, 3, 4, 5, 6, 7];

  it('lấy đúng phần tử của trang đầu', () => {
    expect(getPageItems(items, 1, 3)).toEqual([1, 2, 3]);
  });

  it('lấy đúng phần tử của trang giữa', () => {
    expect(getPageItems(items, 2, 3)).toEqual([4, 5, 6]);
  });

  it('trang cuối có thể ít phần tử hơn', () => {
    expect(getPageItems(items, 3, 3)).toEqual([7]);
  });

  it('trang vượt quá dữ liệu trả về mảng rỗng', () => {
    expect(getPageItems(items, 5, 3)).toEqual([]);
  });
});

describe('formatPageNumber', () => {
  it('đệm số 0 cho số 1 chữ số', () => {
    expect(formatPageNumber(1)).toBe('01');
    expect(formatPageNumber(9)).toBe('09');
  });

  it('giữ nguyên số từ 2 chữ số trở lên', () => {
    expect(formatPageNumber(12)).toBe('12');
    expect(formatPageNumber(100)).toBe('100');
  });
});

describe('getPrevPage', () => {
  it('giảm 1 khi lớn hơn 1', () => {
    expect(getPrevPage(3)).toBe(2);
  });

  it('không xuống dưới 1', () => {
    expect(getPrevPage(1)).toBe(1);
  });
});

describe('getNextPage', () => {
  it('tăng 1 khi chưa tới trang cuối', () => {
    expect(getNextPage(1, 3)).toBe(2);
  });

  it('không vượt quá tổng số trang', () => {
    expect(getNextPage(3, 3)).toBe(3);
  });
});
