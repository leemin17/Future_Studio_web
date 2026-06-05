const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Future Studio Backend is running!');
});

// Mock API Route (Đọc dữ liệu từ folder /data sau này)
app.get('/api/news', (req, res) => {
    res.json([
        { id: 1, title: "Lịch giao hàng dịp Lễ Tuần lễ Vàng", date: "2024.04.05" },
        { id: 2, title: "Mở rộng cửa hàng thực tế dōzo!", date: "2024.03.26" }
    ]);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});