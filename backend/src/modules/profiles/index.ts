import { Router } from 'express';
import { Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth';
import { generateSlug } from '../../utils';
import { calculateTrendingScore } from '../../services/rankingService';
import { initialProfiles, ProfileRecord } from '../../services/seedData';

// Validation Schema
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

// Single-source state
let profilesStore: ProfileRecord[] = [...initialProfiles];

export interface ProfileQuery {
  category?: string;
  country?: string;
  state?: string;
  stage?: string;
  q?: string;
  featured?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const profilesService = {
  getProfiles(query: ProfileQuery) {
    let result = profilesStore.filter(p => p.status === 'APPROVED');

    if (query.category) {
      result = result.filter(p => p.categoryId === query.category);
    }
    if (query.country) {
      result = result.filter(p => p.countryId === query.country);
    }
    if (query.state) {
      result = result.filter(p => p.stateId === query.state);
    }
    if (query.stage) {
      result = result.filter(p => p.stage.toLowerCase() === query.stage!.toLowerCase());
    }
    if (query.featured === 'true') {
      result = result.filter(p => p.isFeatured);
    }
    if (query.q) {
      const q = query.q.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.founder.toLowerCase().includes(q) ||
        p.productService.toLowerCase().includes(q)
      );
    }

    if (query.sort === 'trending') {
      result.sort((a, b) => b.trendingScore - a.trendingScore);
    } else if (query.sort === 'recent') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (query.sort === 'followers') {
      result.sort((a, b) => b.followerCount - a.followerCount);
    } else {
      result.sort((a, b) => b.viewCount - a.viewCount);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = result.length;
    const paginated = result.slice((page - 1) * limit, page * limit);

    return {
      profiles: paginated,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  },

  getTrending(limit = 8) {
    const approved = profilesStore.filter(p => p.status === 'APPROVED');
    return [...approved].sort((a, b) => b.trendingScore - a.trendingScore).slice(0, limit);
  },

  getBySlug(slug: string) {
    const profile = profilesStore.find(p => p.slug === slug && p.status === 'APPROVED');
    if (!profile) return null;

    profile.viewCount += 1;
    profile.trendingScore = calculateTrendingScore({
      viewCount: profile.viewCount,
      followerCount: profile.followerCount,
      saveCount: profile.saveCount,
    });
    return profile;
  },

  getById(id: string) {
    return profilesStore.find(p => p._id === id || p.slug === id) || null;
  },

  create(data: any, ownerId: string, role: string) {
    const slug = generateSlug(data.name);
    const newProfile: ProfileRecord = {
      _id: `p-${Date.now()}`,
      ownerId,
      name: data.name,
      slug,
      logo: data.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
      shortDescription: data.shortDescription,
      description: data.description || data.shortDescription,
      website: data.website || 'https://example.com',
      founder: data.founder || 'Founder',
      categoryId: data.categoryId,
      subCategoryId: data.subCategoryId || 'general',
      countryId: data.countryId || 'reg-us',
      stateId: data.stateId || 'st-ca',
      cityId: data.cityId || 'San Francisco',
      foundedYear: Number(data.foundedYear) || new Date().getFullYear(),
      stage: data.stage || 'Seed',
      businessModel: data.businessModel || 'B2B SaaS',
      teamSize: data.teamSize || '10',
      productService: data.productService || data.shortDescription,
      socialLinks: data.socialLinks || {},
      funding: data.funding || '$1M Seed',
      ipInfo: data.ipInfo || 'Proprietary IP and Algorithms',
      status: role === 'admin' ? 'APPROVED' : 'PENDING',
      isFeatured: false,
      viewCount: 0,
      followerCount: 0,
      saveCount: 0,
      trendingScore: 10.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    profilesStore.push(newProfile);
    return newProfile;
  },

  update(id: string, data: any, userId: string, role: string) {
    const profile = profilesStore.find(p => p._id === id);
    if (!profile) return null;

    if (profile.ownerId !== userId && role !== 'admin') {
      throw new Error('Unauthorized');
    }

    Object.assign(profile, data, { updatedAt: new Date().toISOString() });
    if (role !== 'admin' && data.name) {
      profile.status = 'PENDING';
    }

    profile.trendingScore = calculateTrendingScore(profile);
    return profile;
  },

  delete(id: string, userId: string, role: string) {
    const idx = profilesStore.findIndex(p => p._id === id);
    if (idx === -1) return false;

    const profile = profilesStore[idx];
    if (profile.ownerId !== userId && role !== 'admin') {
      throw new Error('Unauthorized');
    }

    profilesStore.splice(idx, 1);
    return true;
  },

  getUserProfiles(userId: string) {
    return profilesStore.filter(p => p.ownerId === userId);
  },

  getStore(): ProfileRecord[] {
    return profilesStore;
  }
};

export const profilesController = {
  getProfiles(req: Request, res: Response) {
    const { category, country, state, stage, q, featured, sort, page = '1', limit = '20' } = req.query;
    const data = profilesService.getProfiles({
      category: category as string,
      country: country as string,
      state: state as string,
      stage: stage as string,
      q: q as string,
      featured: featured as string,
      sort: sort as string,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    });
    return res.json(data);
  },

  getTrending(req: Request, res: Response) {
    return res.json(profilesService.getTrending(8));
  },

  getPublicProfile(req: Request, res: Response) {
    const profile = profilesService.getBySlug(req.params.slug);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found or pending approval' });
    }
    return res.json(profile);
  },

  getById(req: Request, res: Response) {
    const profile = profilesService.getById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    return res.json(profile);
  },

  create(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = profileCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation error' });
      }
      const newProfile = profilesService.create(parsed.data, req.user!.userId, req.user!.role);
      return res.status(201).json(newProfile);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  update(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = profileUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation error' });
      }
      const updated = profilesService.update(req.params.id, parsed.data, req.user!.userId, req.user!.role);
      if (!updated) return res.status(404).json({ error: 'Profile not found' });
      return res.json(updated);
    } catch (err: any) {
      return res.status(403).json({ error: err.message });
    }
  },

  delete(req: AuthenticatedRequest, res: Response) {
    try {
      const success = profilesService.delete(req.params.id, req.user!.userId, req.user!.role);
      if (!success) return res.status(404).json({ error: 'Profile not found' });
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(403).json({ error: err.message });
    }
  },

  getUserProfiles(req: AuthenticatedRequest, res: Response) {
    return res.json(profilesService.getUserProfiles(req.user!.userId));
  }
};

export const profilesRouter = Router();
profilesRouter.get('/', profilesController.getProfiles);
profilesRouter.post('/', authMiddleware, profilesController.create);
profilesRouter.get('/:id', profilesController.getById);
profilesRouter.patch('/:id', authMiddleware, profilesController.update);
profilesRouter.delete('/:id', authMiddleware, profilesController.delete);
