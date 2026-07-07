// Tiện ích dùng chung để dựng đường dẫn tới tài nguyên (ảnh, video, model).

// Nối một đường dẫn tương đối với BASE_URL của Vite.
export const getAssetUrl = (path: string): string =>
  `${import.meta.env.BASE_URL}${path}`;

// Trả về URL tuyệt đối nguyên vẹn (vd: thumbnail từ Vimeo), còn URL tương đối
// thì nối thêm BASE_URL.
export const resolveMediaUrl = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return getAssetUrl(url);
};
