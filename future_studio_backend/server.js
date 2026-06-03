const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000; // Server backend sẽ chạy ở cổng 5000

// 1. Cấu hình CORS để cho phép Frontend (ví dụ chạy ở port 3000 hoặc 5173) gọi sang lấy dữ liệu
app.use(cors());
app.use(express.json());

// Hàm trợ giúp để đọc nhanh file JSON từ thư mục data
const readJsonFile = (fileName) => {
    const filePath = path.join(__dirname, 'data', fileName);
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
};

/* =====================================================================
   ĐỊNH NGHĨA CÁC ĐƯỜNG DẪN API (ROUTES)
   ===================================================================== */

// API 1: Lấy danh sách tin tức / sản phẩm (All Products)
app.get('/api/news', (req, res) => {
    try {
        const data = readJsonFile('news.json');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi không thể đọc file news.json', error: error.message });
    }
});

// API 2: Lấy danh sách sản phẩm nổi bật (Pickup)
app.get('/api/pickup', (req, res) => {
    try {
        const data = readJsonFile('pickup.json');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi không thể đọc file pickup.json', error: error.message });
    }
});

// API 3: Test thử xem server Backend chạy ổn định không
app.get('/', (req, res) => {
    res.send('Server Backend của Future Studio đang chạy !');
});

// Khởi chạy server lắng nghe các yêu cầu từ máy tính
app.listen(PORT, () => {
    console.log(`[OK] Backend Server đang chạy tại: http://localhost:${PORT}`);
});