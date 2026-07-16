import { Router } from 'express';
import type { ProductCategory } from '../../../shared/types.ts';
import { getProduct, getProducts } from '../services/productService.ts';

const router = Router();

router.get('/', async (_request, response) => response.json(await getProducts()));
router.get('/category/:category', async (request, response) => {
  response.json(await getProducts(request.params.category as ProductCategory));
});
router.get('/:id', async (request, response) => {
  const product = await getProduct(Number(request.params.id));
  if (!product) return response.status(404).json({ message: 'Product not found' });
  return response.json(product);
});

export default router;
