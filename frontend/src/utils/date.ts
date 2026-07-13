// Tiện ích dùng chung để xử lý ngày ở định dạng "yyyy.mm.dd" của dữ liệu bài viết.

// Chuyển chuỗi ngày "yyyy.mm.dd" thành timestamp (ms). Trả về NaN nếu không hợp lệ.
export const parseNewsDate = (dateStr: string): number =>
  new Date(dateStr.replace(/\./g, '-')).getTime();

// Sắp xếp một mảng theo ngày mới nhất trước, đẩy các mục có ngày không hợp lệ
// (vd: "THANK YOU", "CREATIVE") xuống cuối. Trả về mảng mới, không thay đổi mảng gốc.
export const sortByDateDesc = <T extends { date: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => {
    const timeA = parseNewsDate(a.date);
    const timeB = parseNewsDate(b.date);

    const isAValid = !isNaN(timeA);
    const isBValid = !isNaN(timeB);

    if (isAValid && isBValid) return timeB - timeA;
    if (isAValid) return -1;
    if (isBValid) return 1;
    return 0;
  });
