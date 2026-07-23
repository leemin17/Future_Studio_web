import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.ts';
import {
  createBrand,
  deleteBrand,
  getBrandBySlug,
  getBrands,
  updateBrand,
} from '../services/brandService.ts';
import { brandInputSchema, idSchema, slugSchema } from '../validation/schemas.ts';

const router = Router();

router.get('/', async (_request, response) => response.json(await getBrands()));
router.get('/admin/all', ...requireAdmin, async (_request, response) => response.json(await getBrands(true)));
router.get('/:slug', async (request, response) => {
  const brand = await getBrandBySlug(slugSchema.parse(request.params.slug));
  if (!brand) return response.status(404).json({ message: 'Brand not found' });
  return response.json(brand);
});
router.post('/', ...requireAdmin, async (request, response) => {
  response.status(201).json(await createBrand(brandInputSchema.parse(request.body)));
});
router.put('/:id', ...requireAdmin, async (request, response) => {
  response.json(await updateBrand(idSchema.parse(request.params.id), brandInputSchema.parse(request.body)));
});
router.delete('/:id', ...requireAdmin, async (request, response) => {
  await deleteBrand(idSchema.parse(request.params.id));
  response.status(204).send();
});

export default router;
