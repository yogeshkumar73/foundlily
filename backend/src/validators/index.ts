import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileCreateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  subCategoryId: z.string().optional(),
  countryId: z.string().optional(),
  stateId: z.string().optional(),
  cityId: z.string().optional(),
  foundedYear: z.union([z.number(), z.string()]).optional(),
  stage: z.string().optional(),
  businessModel: z.string().optional(),
  teamSize: z.string().optional(),
  productService: z.string().optional(),
  website: z.string().optional(),
  founder: z.string().optional(),
  socialLinks: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    discord: z.string().optional(),
  }).optional(),
  funding: z.string().optional(),
  ipInfo: z.string().optional(),
  logo: z.string().optional(),
});

export const profileUpdateSchema = profileCreateSchema.partial().extend({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'DRAFT']).optional(),
  isFeatured: z.boolean().optional(),
});
