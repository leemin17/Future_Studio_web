/* =====================================================================
   TIỆN ÍCH PHÂN TRANG
   Logic phân trang thuần, tách khỏi component Body để dễ kiểm thử.
   ===================================================================== */

// Tổng số trang cần thiết để chứa `totalItems` với `itemsPerPage` mỗi trang.
export const getTotalPages = (
  totalItems: number,
  itemsPerPage: number,
): number => {
  if (itemsPerPage <= 0) return 0;
  return Math.ceil(totalItems / itemsPerPage);
};

// Lấy các phần tử thuộc trang `page` (bắt đầu từ 1).
export const getPageItems = <T>(
  items: T[],
  page: number,
  itemsPerPage: number,
): T[] => {
  const start = (page - 1) * itemsPerPage;
  return items.slice(start, start + itemsPerPage);
};

// Định dạng số trang thành chuỗi 2 chữ số (vd 1 -> '01').
export const formatPageNumber = (page: number): string =>
  String(page).padStart(2, '0');

// Trang trước đó, không nhỏ hơn 1.
export const getPrevPage = (currentPage: number): number =>
  currentPage > 1 ? currentPage - 1 : currentPage;

// Trang kế tiếp, không vượt quá tổng số trang.
export const getNextPage = (
  currentPage: number,
  totalPages: number,
): number => (currentPage < totalPages ? currentPage + 1 : currentPage);
