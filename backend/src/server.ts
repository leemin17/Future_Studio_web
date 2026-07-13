import cors from 'cors';
import express from 'express';
import {
  artData,
  contactLinks,
  cartoon3DData,
  ctvData,
  heroDetails,
  heroImages,
  navItems,
  newsData,
  popularSearches,
  teamMembers,
  musicData,
} from '../../data/database.ts';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

app.use(cors({ origin: frontendUrl }));
app.use(express.json());

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.get('/api/products', (_request, response) => response.json(newsData));
app.get('/api/products/cartoon-3d', (_request, response) => response.json(cartoon3DData));
app.get('/api/products/ctv', (_request, response) => response.json(ctvData));
app.get('/api/products/art', (_request, response) => response.json(artData));
app.get('/api/products/music', (_request, response) => response.json(musicData));
app.get('/api/products/:id', (request, response) => {
  const product = newsData.find((item) => item.id === Number(request.params.id));
  if (!product) return response.status(404).json({ message: 'Product not found' });
  return response.json(product);
});
app.get('/api/hero', (_request, response) => response.json({ media: heroImages, details: heroDetails }));
app.get('/api/team', (_request, response) => response.json(teamMembers));
app.get('/api/contact', (_request, response) => response.json(contactLinks));
app.get('/api/navigation', (_request, response) => response.json(navItems));
app.get('/api/search/suggestions', (_request, response) => response.json(popularSearches));
app.get('/api/data', (_request, response) => response.json({
  heroImages,
  heroDetails,
  newsData,
  teamMembers,
  navItems,
  contactLinks,
  popularSearches,
}));

app.listen(port, () => {
  console.log(`Future Studio API running at http://localhost:${port}`);
});
