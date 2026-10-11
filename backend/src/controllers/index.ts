import { Request, Response } from 'express';
import { authService, profileService, metadataService } from '../services';
import { registerSchema, loginSchema, profileCreateSchema, profileUpdateSchema } from '../validators';
import { signToken } from '../lib/auth';
import { AuthenticatedRequest } from '../middleware/auth';
import { GoogleGenAI } from '@google/genai';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      }

      const user = await authService.register(parsed.data.name, parsed.data.email, parsed.data.password);
      const token = signToken(user);

      // Set secure HTTP-only cookie as required by Blueprint Section 15
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        token,
        user: {
          _id: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        }
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Registration failed' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      }

      const user = await authService.login(parsed.data.email, parsed.data.password);
      const token = signToken(user);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        token,
        user: {
          _id: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        }
      });
    } catch (err: any) {
      return res.status(401).json({ error: err.message || 'Invalid email or password' });
    }
  },

  async logout(req: Request, res: Response) {
    res.clearCookie('token');
    return res.json({ success: true, message: 'Logged out successfully' });
  },

  async session(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Session not found' });
    }
    const user = await authService.getUserById(req.user.userId);
    if (!user) {
      return res.status(401).json({ error: 'User does not exist' });
    }
    return res.json({
      user: {
        _id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      }
    });
  }
};

export const profileController = {
  async getProfiles(req: Request, res: Response) {
    try {
      const { category, country, state, stage, q, featured, sort, page = '1', limit = '20' } = req.query;
      const data = await profileService.getProfiles({
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
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch profiles' });
    }
  },

  async getTrending(req: Request, res: Response) {
    try {
      const data = await profileService.getTrending(8);
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch trending' });
    }
  },

  async getPublicProfile(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const profile = await profileService.getBySlug(slug);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found or pending approval' });
      }
      return res.json(profile);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const profile = await profileService.getById(id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      return res.json(profile);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = profileCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation error' });
      }
      const newProfile = await profileService.create(parsed.data, req.user!.userId, req.user!.role);
      return res.status(201).json(newProfile);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = profileUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation error' });
      }
      const updated = await profileService.update(req.params.id, parsed.data, req.user!.userId, req.user!.role);
      if (!updated) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      return res.json(updated);
    } catch (err: any) {
      return res.status(403).json({ error: err.message });
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const success = await profileService.delete(req.params.id, req.user!.userId, req.user!.role);
      if (!success) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(403).json({ error: err.message });
    }
  },

  async getUserProfiles(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await profileService.getUserProfiles(req.user!.userId);
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async getSavedProfiles(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await profileService.getSavedProfiles(req.user!.userId);
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async follow(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await profileService.follow(req.user!.userId, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  async unfollow(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await profileService.unfollow(req.user!.userId, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  async save(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await profileService.save(req.user!.userId, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  async unsave(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await profileService.unsave(req.user!.userId, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  async recordAnalytics(req: Request, res: Response) {
    try {
      const { profileId, eventType, metadata } = req.body;
      const event = await profileService.recordAnalytics(profileId, eventType, undefined, metadata);
      return res.json(event);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  async getOwnerAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await profileService.getOwnerAnalytics(req.params.id, req.user!.userId, req.user!.role);
      return res.json(data);
    } catch (err: any) {
      return res.status(403).json({ error: err.message });
    }
  }
};

export const adminController = {
  async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await profileService.getAdminDashboard();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async getPendingProfiles(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await profileService.getPendingProfiles();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async approve(req: AuthenticatedRequest, res: Response) {
    try {
      const profile = await profileService.approveProfile(req.params.id);
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      return res.json(profile);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async reject(req: AuthenticatedRequest, res: Response) {
    try {
      const profile = await profileService.rejectProfile(req.params.id);
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      return res.json(profile);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async feature(req: AuthenticatedRequest, res: Response) {
    try {
      const profile = await profileService.featureProfile(req.params.id);
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      return res.json(profile);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const success = await profileService.adminDeleteProfile(req.params.id);
      if (!success) return res.status(404).json({ error: 'Profile not found' });
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};

export const generalController = {
  getCategories(req: Request, res: Response) {
    return res.json(metadataService.getCategories());
  },

  getRegions(req: Request, res: Response) {
    return res.json(metadataService.getRegions());
  },

  searchGlobal(req: Request, res: Response) {
    const q = req.query.q as string || '';
    return res.json(metadataService.searchGlobal(q));
  },

  async pitchReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { profileData } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          feedback: "AI Pitch Reviewer: Your profile looks solid! Focus on clarifying your proprietary IP advantages and target market TAM for investors."
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert venture capitalist and startup advisor. Review the following startup profile and provide 3 actionable bullet points on strengths, 2 areas of improvement, and a projected investor interest score (out of 100).
        Startup Name: ${profileData.name}
        Short Description: ${profileData.shortDescription}
        Stage: ${profileData.stage}
        Business Model: ${profileData.businessModel}
        IP Info: ${profileData.ipInfo}
        `,
      });

      return res.json({ feedback: response.text });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      return res.json({ feedback: "AI evaluation currently unavailable. Ensure your pitch highlights clear market differentiation." });
    }
  }
};
