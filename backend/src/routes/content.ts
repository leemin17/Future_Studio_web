import { Router } from 'express';
import { getSiteContent } from '../services/contentService.ts';

const router = Router();
const keys = {
  hero: 'hero_media',
  'hero-details': 'hero_details',
  team: 'team_members',
  contact: 'contact_links',
  navigation: 'navigation',
  'search-suggestions': 'popular_searches',
} as const;

router.get('/:resource', async (request, response) => {
  const key = keys[request.params.resource as keyof typeof keys];
  if (!key) return response.status(404).json({ message: 'Content resource not found' });
  return response.json(await getSiteContent(key));
});

export default router;
