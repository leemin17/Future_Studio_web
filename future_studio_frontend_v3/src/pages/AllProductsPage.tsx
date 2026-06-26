import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { newsData, customerData, type NewsItem } from '../data/database';
import QuickViewModal from '../components/QuickViewModal';
import Player from '@vimeo/player';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null); // Ref cho thẻ <video>
  const [isHovering, setIsHovering] = useState(false);
  // State để lưu thumbnail URL, khởi tạo với ảnh fallback từ database
  const [thumbnailUrl, setThumbnailUrl] = useState(item.imageUrl);

  const isVimeo = useMemo(() => item.videoUrl?.includes('vimeo'), [item.videoUrl]);

  // useEffect mới: Tự động lấy thumbnail từ API chính thức của Vimeo
  useEffect(() => {
    if (isVimeo && item.videoUrl) {
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
  }, [isVimeo, item.videoUrl]);

  // Khởi tạo Vimeo Player khi component được mount hoặc videoUrl thay đổi
  useEffect(() => {
    // Chỉ xử lý khi là video Vimeo
    if (isVimeo && item.videoUrl && playerContainerRef.current) {
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
  }, [item.videoUrl, isVimeo]);

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

  // Hàm tiện ích để xử lý cả URL tuyệt đối (từ Vimeo) và tương đối (local)
  const getFullImageUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${import.meta.env.BASE_URL}${url}`;
  };

  return (
    <motion.div
      ref={cardRef}
      className="news-card"
      onClick={onClick}
      variants={gridItemVariants}
      layout
    >
      <div
        className="news-image natural-size"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Lớp ảnh thumbnail, luôn hiển thị làm nền */}
        <img
          src={getFullImageUrl(thumbnailUrl)}
          alt={`${item.project_name} - ${item.clientInformation}`}
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
              // GIẢI PHÁP: Thêm thuộc tính này để lớp video không "bắt" sự kiện chuột,
              // cho phép sự kiện hover trên thẻ .news-image cha hoạt động ổn định.
              pointerEvents: 'none',
            }}
          >
            {isVimeo ? (
              <div ref={playerContainerRef} className="vimeo-player-container" />
            ) : (
              <video
                ref={videoRef}
                src={`${import.meta.env.BASE_URL}${item.videoUrl}`}
                muted
                loop
                playsInline
                style={{ pointerEvents: 'none' }} // Đảm bảo sự kiện hover hoạt động nhất quán
              />
            )}
          </div>
        )}
        <p className="news-text">{item.project_name} - {item.clientInformation}</p>
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

  // Tối ưu hóa: Chỉ gộp và sắp xếp lại sản phẩm một lần bằng useMemo
  const allProducts = useMemo(() => 
    [...newsData, ...customerData].sort((a, b) => 
      new Date(b.date.replace(/\./g, '-')).getTime() - new Date(a.date.replace(/\./g, '-')).getTime()
    ), 
  []);

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
