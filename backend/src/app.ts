import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { ZodError } from 'zod';
import authRoutes from './routes/auth.ts';
import brandRoutes from './routes/brands.ts';
import contentRoutes from './routes/content.ts';
import memberRoutes from './routes/members.ts';
import productRoutes from './routes/products.ts';
import uploadRoutes from './routes/uploads.ts';

const toOrigin = (value: string | undefined) => {
  const host = value?.trim();
  if (!host) return null;
  return host.startsWith('http://') || host.startsWith('https://') ? host : `https://${host}`;
};

const allowedOrigins = () => Array.from(new Set([
  ...(process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => toOrigin(origin)),
  toOrigin(process.env.VERCEL_URL),
  toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
].filter((origin): origin is string => Boolean(origin))));

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: allowedOrigins() }));
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/brands', brandRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/members', memberRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/uploads', uploadRoutes);

  app.use((_request, response) => response.status(404).json({ message: 'API route not found' }));
  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof ZodError) {
      return response.status(400).json({ message: 'Invalid request data', issues: error.issues });
    }
    console.error(error);
    return response.status(500).json({ message: 'Internal server error' });
  });

  return app;
};
