import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.ts';
import { createMember, deleteMember, getMembers, updateMember } from '../services/memberService.ts';
import { idSchema, memberInputSchema } from '../validation/schemas.ts';

const router = Router();

router.get('/', async (_request, response) => response.json(await getMembers()));
router.post('/', ...requireAdmin, async (request, response) => {
  response.status(201).json(await createMember(memberInputSchema.parse(request.body)));
});
router.put('/:id', ...requireAdmin, async (request, response) => {
  response.json(await updateMember(idSchema.parse(request.params.id), memberInputSchema.parse(request.body)));
});
router.delete('/:id', ...requireAdmin, async (request, response) => {
  await deleteMember(idSchema.parse(request.params.id));
  response.status(204).send();
});

export default router;
