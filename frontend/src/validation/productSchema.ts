import { z } from 'zod';

const optionalUrl = z.string().trim().refine((value) => {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}, 'Enter a complete URL beginning with http:// or https://.');

export const productFormSchema = z.object({
  title: z.string().trim().min(2, 'Project title must contain at least 2 characters.'),
  clientInformation: z.string().trim().min(2, 'Client name must contain at least 2 characters.'),
  category: z.enum(['tvc', 'cartoon-3d', 'art', 'showreel']),
  date: z.string().min(1, 'Choose the project date.'),
  describe: z.string().trim().min(10, 'Description must contain at least 10 characters.'),
  imageUrl: optionalUrl,
  partnerLogoUrl: optionalUrl,
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
