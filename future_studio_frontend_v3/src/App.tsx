import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import Header from './components/Header';
import AppRoutes from './pages';
// THÊM: Import component CustomCursor mà anh đã tạo ở Bước 2
// import CustomCursor from './components/CustomCursor';
import { useAppNavigation } from './hooks/useAppNavigation';

/* =====================================================================
   5. COMPONENT GỐC (APP) LẮP RÁP CÁC ROUTE
   ===================================================================== */
const App: React.FC = () => {
  const location = useLocation();
  const { goHome } = useAppNavigation();

  // Biến kiểm tra xem có đang ở trang phụ (trang chi tiết) hay không
  const isAtDetailPage = location.pathname !== '/';

  // SỬA LỖI: Header chỉ "dính" lại (sticky) sau khi cuộn 800px trên mọi trang,
  // gây ra lỗi trên trang chi tiết (vốn không có banner lớn).
  // YÊU CẦU MỚI: Bỏ hiệu ứng tự hiện ra khi cuộn, cho Header luôn cố định ở trên cùng.
  const showFixedHeader = true;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleResetHome = goHome;

  return (
    <>
      {/* THÊM: Đặt CustomCursor ở ngoài cùng ứng dụng để nó luôn chạy bất kể ở trang nào */}
      {/* <CustomCursor /> */}

      <Header
        onLogoClick={handleResetHome}
        showFixedHeader={showFixedHeader}
        isAtDetailPage={isAtDetailPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Thêm thẻ main để bọc nội dung và xử lý padding cho header cố định */}
      <main className={isAtDetailPage ? 'main-content-padding' : ''}>
        <AppRoutes />
      </main>
    </>
  );
};

export default App;