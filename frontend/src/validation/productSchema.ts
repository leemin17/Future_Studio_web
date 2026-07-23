import { z } from 'zod';

const optionalMediaUrl = z.string().trim().refine((value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return /^\/?(?:images|videos|models|uploads)\//i.test(value);
  }
}, 'Enter a complete URL or an existing public media path.');

export const productFormSchema = z.object({
  title: z.string().trim().min(2, 'Project title must contain at least 2 characters.'),
  category: z.enum(['tvc', 'cartoon-3d', 'art', 'showreel']),
  date: z.string().min(1, 'Choose the project date.'),
  describe: z.string().trim().min(10, 'Description must contain at least 10 characters.'),
  imageUrl: optionalMediaUrl,
  brandId: z.string().min(1, 'Choose a collaboration brand.'),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
