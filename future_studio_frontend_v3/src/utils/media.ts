/* =====================================================================
   TIỆN ÍCH XỬ LÝ MEDIA (VIDEO / HÌNH ẢNH)
   Tách riêng các hàm thuần (pure functions) để tái sử dụng và kiểm thử.
   ===================================================================== */

// Lấy ID video từ một URL Vimeo bất kỳ. Trả về null nếu không tìm thấy.
export const getVimeoId = (url: string): string | null => {
  if (!url) return null;
  const match = /vimeo.*\/(\d+)/i.exec(url);
  return match ? match[1] : null;
};

// Kiểm tra một URL có phải là đường dẫn tuyệt đối (http/https) hay không.
export const isAbsoluteUrl = (url: string): boolean =>
  /^https?:\/\//i.test(url);

// Chuẩn hóa đường dẫn tài nguyên: giữ nguyên URL tuyệt đối,
// hoặc gắn thêm baseUrl cho đường dẫn tương đối (dùng cho ảnh/video local).
export const resolveAssetUrl = (
  url: string,
  baseUrl: string = import.meta.env.BASE_URL,
): string => {
  if (!url) return url;
  if (isAbsoluteUrl(url)) return url;
  return `${baseUrl}${url}`;
};
