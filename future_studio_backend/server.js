const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins for CORS — restrict to known frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://leemin17.github.io',
];

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

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