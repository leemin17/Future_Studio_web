// Cuộn mượt về đầu trang. Dùng chung cho điều hướng ở nhiều nơi.
export const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
