import { describe, expect, it } from 'vitest';
import { productInputSchema } from './schemas.ts';

const legacyProduct = {
  date: '2024.02.15',
  title: 'Air Asia',
  describe: 'Description for Air Asia.',
  imageUrl: 'images/AIR ASIA/FINAL COMP.png',
  brandId: 7,
  category: 'art' as const,
  imageGallery: [],
  videoGallery: [],
  quickViewLayout: [{
    type: 'grid' as const,
    columns: 3 as const,
    items: [
      { kind: 'image' as const, url: 'images/AIR ASIA/ELEMENTS 1.png' },
      { kind: 'image' as const, url: 'images/AIR ASIA/ELEMENTS 2.png' },
    ],
  }],
};

describe('productInputSchema media paths', () => {
  it('accepts existing public media paths when an old project is edited', () => {
    expect(productInputSchema.safeParse(legacyProduct).success).toBe(true);
  });

  it('rejects executable URL schemes', () => {
    expect(productInputSchema.safeParse({
      ...legacyProduct,
      imageUrl: 'javascript:alert(1)',
    }).success).toBe(false);
  });
});

