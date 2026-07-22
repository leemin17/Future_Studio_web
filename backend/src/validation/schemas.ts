import { z } from 'zod';

const optionalUrl = z.string().url().optional().or(z.literal(''));
const quickViewItemSchema = z.object({
  kind: z.enum(['image', 'video', 'text', 'embed', 'model']).optional(),
  url: optionalUrl,
  content: z.string().optional(),
  html: z.string().optional(),
  caption: z.string().optional(),
  textStyle: z.object({
    fontFamily: z.string().optional(),
    fontSize: z.number().positive().optional(),
    fontWeight: z.union([z.literal(400), z.literal(600), z.literal(700), z.literal(800)]).optional(),
    fontStyle: z.enum(['normal', 'italic']).optional(),
    textDecoration: z.enum(['none', 'underline']).optional(),
    textAlign: z.enum(['left', 'center', 'right']).optional(),
    color: z.string().optional(),
    backgroundColor: z.string().optional(),
    width: z.union([z.literal(50), z.literal(75), z.literal(100)]).optional(),
  }).optional(),
});

export const productInputSchema = z.object({
  date: z.string().trim().min(1).max(30),
  title: z.string().trim().min(2).max(200),
  clientInformation: z.string().trim().min(2).max(200),
  describe: z.string().trim().min(10).max(10_000),
  imageUrl: z.string().url(),
  partnerLogoUrl: optionalUrl,
  category: z.enum(['cartoon-3d', 'tvc', 'art', 'showreel']).optional(),
  videoUrl: optionalUrl,
  modelUrl: optionalUrl,
  imageGallery: z.array(z.string().url()).max(200).optional(),
  videoGallery: z.array(z.string().url()).max(200).optional(),
  quickViewLayout: z.array(z.object({
    type: z.enum(['grid', 'full', 'text', 'embed', 'model']),
    columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
    items: z.array(quickViewItemSchema).max(200),
  })).max(200).optional(),
});

export const memberInputSchema = z.object({
  name: z.string().trim().min(2).max(150),
  role: z.string().trim().min(2).max(150),
  image: z.string().url(),
  color: z.string().trim().min(1).max(100),
  bio: z.string().trim().min(2).max(5_000),
  socials: z.record(z.string(), z.string()).optional(),
  skills: z.array(z.object({
    name: z.string().trim().min(1).max(100),
    level: z.number().min(0).max(100),
  })).max(100).optional(),
});

export const idSchema = z.coerce.number().int().positive();

export const uploadRequestSchema = z.object({
  projectTitle: z.string().trim().min(1).max(200),
  files: z.array(z.object({
    name: z.string().trim().min(1).max(255),
    contentType: z.string().trim().min(1).max(150),
  })).min(1).max(100),
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type MemberInput = z.infer<typeof memberInputSchema>;
