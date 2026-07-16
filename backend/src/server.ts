import cors from 'cors';
import express from 'express';
import contentRoutes from './routes/content.ts';
import productRoutes from './routes/products.ts';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

app.use(cors({ origin: frontendUrl }));
app.use(express.json());

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api/products', productRoutes);
app.use('/api/content', contentRoutes);

app.listen(port, () => {
  console.log(`Future Studio API running at http://localhost:${port}`);
});
