import { Router } from 'express';
import { getSiteContent } from '../services/contentService.ts';

const router = Router();
const aliases = {
  hero: 'hero_media',
  'hero-details': 'hero_details',
  team: 'team_members',
  contact: 'contact_links',
  navigation: 'navigation',
  'search-suggestions': 'popular_searches',
} as const;
const allowedKeys = new Set([
  'hero_media',
  'hero_details',
  'team_members',
  'contact_links',
  'navigation',
  'popular_searches',
]);

router.get('/:resource', async (request, response) => {
  const resource = request.params.resource;
  const key = aliases[resource as keyof typeof aliases] ?? (allowedKeys.has(resource) ? resource : undefined);
  if (!key) return response.status(404).json({ message: 'Content resource not found' });
  return response.json(await getSiteContent(key));
});

export default router;
