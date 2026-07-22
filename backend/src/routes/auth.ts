import { Router } from 'express';
import { isAdminUser, requireAuthenticated, type AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

router.get('/me', requireAuthenticated, async (request: AuthenticatedRequest, response) => {
  const user = request.user!;
  response.json({
    id: user.id,
    email: user.email,
    isAdmin: await isAdminUser(user),
  });
});

export default router;
