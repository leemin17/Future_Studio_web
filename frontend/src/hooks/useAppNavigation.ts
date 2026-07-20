import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { scrollToTop } from '../utils/scroll';

// Hook dùng chung gom các thao tác điều hướng lặp lại trong toàn ứng dụng:
// luôn cuộn mượt về đầu trang sau khi chuyển trang.
export const useAppNavigation = () => {
  const navigate = useNavigate();

  const goHome = useCallback(() => {
    navigate('/');
    scrollToTop();
  }, [navigate]);

  const goToProduct = useCallback(
    (id: number | string) => {
      navigate(`/projects/project-${id}`);
      scrollToTop();
    },
    [navigate],
  );

  return { navigate, scrollToTop, goHome, goToProduct };
};
