import { Router } from 'express';
import type { ProductCategory } from '../../../shared/types.ts';
import { requireAdmin } from '../middleware/auth.ts';
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from '../services/productService.ts';
import { idSchema, productInputSchema } from '../validation/schemas.ts';

const router = Router();

router.get('/', async (_request, response) => response.json(await getProducts()));
router.get('/category/:category', async (request, response) => {
  response.json(await getProducts(request.params.category as ProductCategory));
});
router.get('/:id', async (request, response) => {
  const product = await getProduct(idSchema.parse(request.params.id));
  if (!product) return response.status(404).json({ message: 'Product not found' });
  return response.json(product);
});
router.post('/', ...requireAdmin, async (request, response) => {
  response.status(201).json(await createProduct(productInputSchema.parse(request.body)));
});
router.put('/:id', ...requireAdmin, async (request, response) => {
  response.json(await updateProduct(idSchema.parse(request.params.id), productInputSchema.parse(request.body)));
});
router.delete('/:id', ...requireAdmin, async (request, response) => {
  await deleteProduct(idSchema.parse(request.params.id));
  response.status(204).send();
});

export default router;
