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

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', message: `Route ${req.method} ${req.path} does not exist` });
});

// Global error handling middleware
app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    });
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful handling of unhandled rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    server.close(() => {
        process.exit(1);
    });
});