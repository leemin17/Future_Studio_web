import { describe, expect, it } from 'vitest';
import { productFormSchema } from './productSchema';

const validProduct = {
  title: 'Future Studio Showreel',
  category: 'showreel' as const,
  date: '2026-07-20',
  describe: 'A complete visual production project for Future Studio.',
  imageUrl: 'https://example.com/cover.jpg',
  brandId: '7',
};

describe('Kiem tra du lieu san pham', () => {
  it('chap nhan du lieu hop le', () => {
    expect(productFormSchema.safeParse(validProduct).success).toBe(true);
  });

  it('tu choi URL anh bia khong hop le', () => {
    const result = productFormSchema.safeParse({ ...validProduct, imageUrl: 'anh-khong-hop-le' });
    expect(result.success).toBe(false);
  });

  it('tu choi mo ta qua ngan', () => {
    const result = productFormSchema.safeParse({ ...validProduct, describe: 'Qua ngan' });
    expect(result.success).toBe(false);
  });

  it('chap nhan duong dan anh cu trong thu muc public', () => {
    const result = productFormSchema.safeParse({
      ...validProduct,
      imageUrl: 'images/AIR ASIA/FINAL COMP.png',
    });
    expect(result.success).toBe(true);
  });

  it('tu choi giao thuc media khong an toan', () => {
    const result = productFormSchema.safeParse({
      ...validProduct,
      imageUrl: 'javascript:alert(1)',
    });
    expect(result.success).toBe(false);
  });
});
