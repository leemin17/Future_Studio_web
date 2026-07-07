import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { newsData, customerData, type NewsItem } from '../data/database';
import QuickViewModal from '../components/QuickViewModal';
import Player from '@vimeo/player';
import { useInView } from 'react-intersection-observer';
import { getAssetUrl, resolveMediaUrl } from '../utils/media';
import { sortByDateDesc } from '../utils/date';

// --- ĐỊNH NGHĨA HIỆU ỨNG SO LE (STAGGERED ANIMATION) ---
// 1. Định nghĩa cho khung lưới bọc ngoài
const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      // Hiệu ứng sẽ áp dụng lần lượt cho các "con" với khoảng trễ 0.1s
      staggerChildren: 0.1,
    },
  },
};

// 2. Định nghĩa cho từng sản phẩm bên trong
const gridItemVariants = {
  hidden: { y: 20, opacity: 0 }, // Bắt đầu từ dưới 20px và trong suốt
  show: { y: 0, opacity: 1 }, // Di chuyển về vị trí 0 và hiện ra
};

// Hàm tiện ích để lấy ID video từ URL của Vimeo
const getVimeoId = (url: string) => {
  const match = /vimeo.*\/(\d+)/i.exec(url);
  return match ? match[1] : null;
};

// =====================================================================
// COMPONENT CARD SẢN PHẨM (ĐÃ ĐƯỢC TÁCH RIÊNG)
// - Đóng gói toàn bộ giao diện và logic cho một thẻ sản phẩm.
// - Sử dụng useRef để tương tác trực tiếp với các phần tử DOM.
// =====================================================================
interface ProductCardProps {
  item: NewsItem;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, onClick }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null); // Ref cho thẻ <video>
  const [isHovering, setIsHovering] = useState(false);
  // State để lưu thumbnail URL, khởi tạo với ảnh fallback từ database
  const [thumbnailUrl, setThumbnailUrl] = useState(item.imageUrl);

  // GIẢI PHÁP HIỆU NĂNG: Chỉ tải video khi card nằm trong màn hình
  // ĐÃ SỬA: Thêm <HTMLDivElement> để TypeScript hiểu rằng ref này
  // sẽ được gắn vào một div, giải quyết lỗi "báo đỏ".
  const { ref, inView } = useInView({
    triggerOnce: true, // Chỉ kích hoạt 1 lần duy nhất
    threshold: 0.1,    // Kích hoạt khi 10% card hiện ra
  });

  const isVimeo = useMemo(() => item.videoUrl?.includes('vimeo'), [item.videoUrl]);

  // useEffect mới: Tự động lấy thumbnail từ API chính thức của Vimeo
  useEffect(() => {
    // Chỉ fetch khi card hiện ra trong màn hình
    if (inView && isVimeo && item.videoUrl) {
      fetch(`https://vimeo.com/api/oembed.json?url=${item.videoUrl}`)
        .then(response => response.json())
        .then(data => {
          // Lấy thumbnail chất lượng cao nhất
          if (data && data.thumbnail_url) {
            setThumbnailUrl(data.thumbnail_url);
          }
        })
        .catch(error => {
          console.error('Lỗi khi lấy thumbnail từ Vimeo, sử dụng ảnh fallback:', error);
        });
    }
  }, [inView, isVimeo, item.videoUrl]);

  // Khởi tạo Vimeo Player khi component được mount hoặc videoUrl thay đổi
  useEffect(() => {
    // Chỉ khởi tạo player khi card hiện ra trong màn hình
    if (inView && isVimeo && item.videoUrl && playerContainerRef.current) {
      const videoId = getVimeoId(item.videoUrl);
      if (videoId) {
        // ĐÃ SỬA: Tắt `background` để video không tự chạy khi vừa tải xong.
        // Thay vào đó, ta cài đặt thủ công các tùy chọn để có hiệu ứng preview (tắt tiếng, lặp lại, ẩn nút)
        // và việc play/pause sẽ được điều khiển bằng sự kiện `handleMouseEnter`/`handleMouseLeave`.
        const player = new Player(playerContainerRef.current, {
          id: parseInt(videoId),
          muted: true,
          loop: true,
          controls: false,
          responsive: true,
        });
        playerRef.current = player;

        // Hủy player khi component unmount để tránh rò rỉ bộ nhớ
        return () => {
          player.destroy();
        };
      }
    }
  }, [inView, item.videoUrl, isVimeo]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (isVimeo && playerRef.current) {
      playerRef.current.play().catch(error => {
        console.error("Lỗi tự động phát video Vimeo:", error);
      });
    } else if (!isVimeo && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Lỗi tự động phát video local:", error);
      });
    }
  };

  // Đã đơn giản hóa: Logic JavaScript phức tạp đã được gỡ bỏ và thay thế
  // bằng giải pháp CSS `pointer-events: none` đáng tin cậy hơn.
  const handleMouseLeave = () => {
    setIsHovering(false);
    if (isVimeo && playerRef.current) {
      playerRef.current.pause();
      playerRef.current.setCurrentTime(0); // Tua về đầu
    } else if (!isVimeo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Tua về đầu
    }
  };

  return (
    <motion.div
      ref={ref} // Gắn ref từ useInView vào đây
      className="news-card"
      variants={gridItemVariants}
      layout
    >
      <div
        className="news-image natural-size"
      >
        {/* Lớp phủ trong suốt để bắt tất cả tương tác, giải quyết mọi vấn đề về sự kiện */}
        <div
          className="interaction-overlay"
          onClick={onClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        {/* Lớp ảnh thumbnail, luôn hiển thị làm nền */}
        <img
          src={resolveMediaUrl(thumbnailUrl)}
          alt={`${item.title} - ${item.clientInformation}`}
        />

        {/* Lớp video, nằm đè lên và chỉ hiện ra khi hover */}
        {item.videoUrl && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: isHovering ? 1 : 0,
              transition: 'opacity 0.3s ease',
              // Đã gỡ bỏ pointer-events: none, vì lớp phủ interaction-overlay đã xử lý tất cả sự kiện.
            }}
          >
            {isVimeo ? (
              <div ref={playerContainerRef} className="vimeo-player-container" />
            ) : (
              <video
                ref={videoRef}
                src={getAssetUrl(item.videoUrl)}
                muted
                loop
                playsInline
              />
            )}
          </div>
        )}
        <p className="news-text">{item.title} - {item.clientInformation}</p>
      </div>
    </motion.div>
  );
};

// =====================================================================
// COMPONENT TRANG CHÍNH
// - Giờ đây chỉ còn nhiệm vụ quản lý state và render ra lưới sản phẩm.
// =====================================================================
const AllProductsPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<NewsItem | null>(null);

  // SỬA LỖI: Sắp xếp sản phẩm một cách an toàn, xử lý các giá trị ngày không hợp lệ
  // để tránh lỗi sắp xếp không nhất quán trên các trình duyệt khác nhau.
  const allProducts = useMemo(
    () => sortByDateDesc([...newsData, ...customerData]),
    [],
  );

  const handleProductClick = (item: NewsItem) => {
    setSelectedProduct(item);
  };

  const handleCloseQuickView = () => {
    setSelectedProduct(null);
  };

  return (
    <>
      {/* --- QUICK VIEW MODAL --- */}
      {/* Component QuickViewModal sẽ chỉ render khi có một sản phẩm được chọn */}
      <QuickViewModal product={selectedProduct} onClose={handleCloseQuickView} />
    <section className="all-products-section">

      {/* Bọc lưới sản phẩm bằng motion.div và áp dụng hiệu ứng container */}
      <motion.div
        className="all-products-grid"
        variants={gridContainerVariants}
        initial="hidden"
        animate="show"
      >
        {allProducts.map((item) => (
          <ProductCard 
            key={item.id}
            item={item}
            onClick={() => handleProductClick(item)}
          />
        ))}
      </motion.div>
    </section>
    </>
  );
};

export default AllProductsPage;
