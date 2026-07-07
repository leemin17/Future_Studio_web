import { describe, it, expect } from 'vitest';
import { getVimeoId, isAbsoluteUrl, resolveAssetUrl } from './media';

describe('getVimeoId', () => {
  it('lấy đúng ID từ URL vimeo.com dạng chuẩn', () => {
    expect(getVimeoId('https://vimeo.com/1204801368')).toBe('1204801368');
  });

  it('lấy ID từ URL player.vimeo.com/video/<id>', () => {
    expect(getVimeoId('https://player.vimeo.com/video/76979871')).toBe('76979871');
  });

  it('không phân biệt hoa/thường trong tên miền', () => {
    expect(getVimeoId('https://VIMEO.com/12345')).toBe('12345');
  });

  it('trả về null khi URL không chứa ID số', () => {
    expect(getVimeoId('https://vimeo.com/channels/staffpicks')).toBeNull();
  });

  it('trả về null với URL không phải vimeo', () => {
    expect(getVimeoId('https://youtube.com/watch?v=123')).toBeNull();
  });

  it('trả về null với chuỗi rỗng', () => {
    expect(getVimeoId('')).toBeNull();
  });
});

describe('isAbsoluteUrl', () => {
  it('nhận diện http và https là tuyệt đối', () => {
    expect(isAbsoluteUrl('http://a.com/x.png')).toBe(true);
    expect(isAbsoluteUrl('https://a.com/x.png')).toBe(true);
  });

  it('đường dẫn tương đối không phải tuyệt đối', () => {
    expect(isAbsoluteUrl('images/logo.png')).toBe(false);
    expect(isAbsoluteUrl('/images/logo.png')).toBe(false);
  });
});

describe('resolveAssetUrl', () => {
  it('giữ nguyên URL tuyệt đối', () => {
    const url = 'https://cdn.example.com/thumb.jpg';
    expect(resolveAssetUrl(url, '/base/')).toBe(url);
  });

  it('gắn baseUrl vào đường dẫn tương đối', () => {
    expect(resolveAssetUrl('images/logo.png', '/app/')).toBe('/app/images/logo.png');
  });

  it('dùng baseUrl mặc định từ import.meta.env khi không truyền', () => {
    expect(resolveAssetUrl('images/logo.png')).toBe(
      `${import.meta.env.BASE_URL}images/logo.png`,
    );
  });

  it('trả về chuỗi rỗng khi đầu vào rỗng', () => {
    expect(resolveAssetUrl('', '/base/')).toBe('');
  });
});
