import { isDbConnected } from '../lib/db';
import { UserModel, ProfileModel, CategoryModel, RegionModel, FollowModel, SavedProfileModel, AnalyticsEventModel } from '../models';
import { hashPassword, comparePassword, generateSlug } from '../utils';
import { calculateTrendingScore } from './rankingService';
import { initialUsers, initialCategories, initialRegions, initialProfiles } from './seedData';

// In-Memory store as instant fallback or memory cache
let memoryUsers = [...initialUsers];
let memoryCategories = [...initialCategories];
let memoryRegions = [...initialRegions];
let memoryProfiles = [...initialProfiles];
let memoryFollows: Array<{ _id: string; userId: string; profileId: string; createdAt: string }> = [];
let memorySaved: Array<{ _id: string; userId: string; profileId: string; createdAt: string }> = [];
let memoryAnalytics: Array<{ _id: string; profileId: string; userId?: string; eventType: string; metadata?: any; createdAt: string }> = [];

export const authService = {
  async register(name: string, email: string, pass: string) {
    const existing = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Email already registered');
    }

    const newUser = {
      _id: `u-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(pass),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      role: 'user' as const,
      createdAt: new Date().toISOString(),
    };
    memoryUsers.push(newUser);

    if (isDbConnected()) {
      try {
        await UserModel.create({
          name: newUser.name,
          email: newUser.email,
          passwordHash: newUser.passwordHash,
          avatar: newUser.avatar,
          role: newUser.role,
        });
      } catch (err) {
        console.warn('MongoDB User save notice:', err);
      }
    }

    return {
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
    };
  },

  async login(email: string, pass: string) {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@foundlily.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminPassword && email.toLowerCase() === adminEmail && pass === adminPassword) {
      let admin = memoryUsers.find(u => u.email.toLowerCase() === adminEmail);
      if (!admin) {
        admin = {
          _id: 'u-admin',
          name: 'Admin Founder',
          email: adminEmail,
          passwordHash: hashPassword(adminPassword),
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          role: 'admin' as const,
          createdAt: new Date().toISOString(),
        };
        memoryUsers.push(admin);
      }
      return {
        userId: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
      };
    }

    let user = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user && isDbConnected()) {
      try {
        const dbUser = await UserModel.findOne({ email: email.toLowerCase() });
        if (dbUser) {
          user = {
            _id: dbUser._id.toString(),
            name: dbUser.name,
            email: dbUser.email,
            passwordHash: dbUser.passwordHash,
            avatar: dbUser.avatar,
            role: dbUser.role as any,
            createdAt: dbUser.createdAt?.toISOString() || new Date().toISOString(),
          };
          memoryUsers.push(user);
        }
      } catch (err) {
        console.warn('DB User lookup fallback notice:', err);
      }
    }

    if (!user || !comparePassword(pass, user.passwordHash)) {
      throw new Error('Invalid email or password');
    }

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };
  },

  async getUserById(id: string) {
    let user = memoryUsers.find(u => u._id === id);
    if (!user && isDbConnected()) {
      try {
        const dbUser = await UserModel.findById(id);
        if (dbUser) {
          user = {
            _id: dbUser._id.toString(),
            name: dbUser.name,
            email: dbUser.email,
            passwordHash: dbUser.passwordHash,
            avatar: dbUser.avatar,
            role: dbUser.role as any,
            createdAt: dbUser.createdAt?.toISOString() || new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('DB getUserById notice:', err);
      }
    }
    if (!user) return null;
    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };
  }
};

export const profileService = {
  async getProfiles(query: {
    category?: string;
    country?: string;
    state?: string;
    stage?: string;
    q?: string;
    featured?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    let result = memoryProfiles.filter(p => p.status === 'APPROVED');

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

  async getTrending(limit = 8) {
    const approved = memoryProfiles.filter(p => p.status === 'APPROVED');
    return [...approved].sort((a, b) => b.trendingScore - a.trendingScore).slice(0, limit);
  },

  async getBySlug(slug: string) {
    const profile = memoryProfiles.find(p => p.slug === slug && p.status === 'APPROVED');
    if (!profile) return null;

    profile.viewCount += 1;
    profile.trendingScore = calculateTrendingScore({
      viewCount: profile.viewCount,
      followerCount: profile.followerCount,
      saveCount: profile.saveCount,
    });

    memoryAnalytics.push({
      _id: `ev-${Date.now()}`,
      profileId: profile._id,
      eventType: 'view',
      createdAt: new Date().toISOString(),
    });

    return profile;
  },

  async getById(id: string) {
    return memoryProfiles.find(p => p._id === id || p.slug === id) || null;
  },

  async create(data: any, ownerId: string, role: string) {
    const slug = generateSlug(data.name);
    const newProfile = {
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
      status: (role === 'admin' ? 'APPROVED' : 'PENDING') as 'APPROVED' | 'PENDING',
      isFeatured: false,
      viewCount: 0,
      followerCount: 0,
      saveCount: 0,
      trendingScore: 10.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryProfiles.push(newProfile);
    return newProfile;
  },

  async update(id: string, data: any, userId: string, role: string) {
    const profile = memoryProfiles.find(p => p._id === id);
    if (!profile) return null;

    if (profile.ownerId !== userId && role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const allowedFields = [
      'name', 'shortDescription', 'description', 'categoryId', 'subCategoryId',
      'countryId', 'stateId', 'cityId', 'foundedYear', 'stage', 'businessModel',
      'teamSize', 'productService', 'website', 'founder', 'socialLinks',
      'funding', 'ipInfo', 'logo'
    ];

    const safeUpdate: any = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        if (key === 'foundedYear' && data[key] !== '') {
          safeUpdate[key] = Number(data[key]) || profile.foundedYear;
        } else {
          safeUpdate[key] = data[key];
        }
      }
    }

    if (role === 'admin') {
      if (data.status !== undefined) safeUpdate.status = data.status;
      if (data.isFeatured !== undefined) safeUpdate.isFeatured = data.isFeatured;
    } else {
      if (data.name !== undefined || data.shortDescription !== undefined || data.description !== undefined || data.ipInfo !== undefined) {
        safeUpdate.status = 'PENDING';
      }
    }

    Object.assign(profile, safeUpdate, { updatedAt: new Date().toISOString() });

    profile.trendingScore = calculateTrendingScore({
      viewCount: profile.viewCount,
      followerCount: profile.followerCount,
      saveCount: profile.saveCount,
    });

    if (isDbConnected()) {
      (ProfileModel as any).findOneAndUpdate({ slug: profile.slug }, safeUpdate).catch((err: any) => {
        console.warn('DB Profile update sync notice:', err);
      });
    }

    return profile;
  },

  async delete(id: string, userId: string, role: string) {
    const idx = memoryProfiles.findIndex(p => p._id === id);
    if (idx === -1) return false;

    const profile = memoryProfiles[idx];
    if (profile.ownerId !== userId && role !== 'admin') {
      throw new Error('Unauthorized');
    }

    memoryProfiles.splice(idx, 1);
    return true;
  },

  async getUserProfiles(userId: string) {
    return memoryProfiles.filter(p => p.ownerId === userId);
  },

  async getSavedProfiles(userId: string) {
    const savedIds = memorySaved.filter(s => s.userId === userId).map(s => s.profileId);
    return memoryProfiles.filter(p => savedIds.includes(p._id));
  },

  async follow(userId: string, profileId: string) {
    const profile = memoryProfiles.find(p => p._id === profileId);
    if (!profile) throw new Error('Profile not found');

    const existing = memoryFollows.find(f => f.userId === userId && f.profileId === profileId);
    if (!existing) {
      memoryFollows.push({ _id: `fol-${Date.now()}`, userId, profileId, createdAt: new Date().toISOString() });
      profile.followerCount += 1;
      profile.trendingScore = calculateTrendingScore(profile);
    }
    return { followerCount: profile.followerCount, followed: true };
  },

  async unfollow(userId: string, profileId: string) {
    const profile = memoryProfiles.find(p => p._id === profileId);
    if (!profile) throw new Error('Profile not found');

    const idx = memoryFollows.findIndex(f => f.userId === userId && f.profileId === profileId);
    if (idx !== -1) {
      memoryFollows.splice(idx, 1);
      profile.followerCount = Math.max(0, profile.followerCount - 1);
      profile.trendingScore = calculateTrendingScore(profile);
    }
    return { followerCount: profile.followerCount, followed: false };
  },

  async save(userId: string, profileId: string) {
    const profile = memoryProfiles.find(p => p._id === profileId);
    if (!profile) throw new Error('Profile not found');

    const existing = memorySaved.find(s => s.userId === userId && s.profileId === profileId);
    if (!existing) {
      memorySaved.push({ _id: `sav-${Date.now()}`, userId, profileId, createdAt: new Date().toISOString() });
      profile.saveCount += 1;
      profile.trendingScore = calculateTrendingScore(profile);
    }
    return { saveCount: profile.saveCount, saved: true };
  },

  async unsave(userId: string, profileId: string) {
    const profile = memoryProfiles.find(p => p._id === profileId);
    if (!profile) throw new Error('Profile not found');

    const idx = memorySaved.findIndex(s => s.userId === userId && s.profileId === profileId);
    if (idx !== -1) {
      memorySaved.splice(idx, 1);
      profile.saveCount = Math.max(0, profile.saveCount - 1);
      profile.trendingScore = calculateTrendingScore(profile);
    }
    return { saveCount: profile.saveCount, saved: false };
  },

  async recordAnalytics(profileId: string, eventType: string, userId?: string, metadata?: any) {
    const event = {
      _id: `ev-${Date.now()}`,
      profileId,
      userId,
      eventType,
      metadata,
      createdAt: new Date().toISOString(),
    };
    memoryAnalytics.push(event);
    return event;
  },

  async getOwnerAnalytics(profileId: string, userId: string, role: string) {
    const profile = memoryProfiles.find(p => p._id === profileId);
    if (!profile) throw new Error('Profile not found');
    if (profile.ownerId !== userId && role !== 'admin') throw new Error('Unauthorized');

    const events = memoryAnalytics.filter(e => e.profileId === profileId);
    return {
      viewCount: profile.viewCount,
      followerCount: profile.followerCount,
      saveCount: profile.saveCount,
      trendingScore: profile.trendingScore,
      eventsCount: events.length,
      recentEvents: events.slice(-10),
    };
  },

  // Admin capabilities
  async getAdminDashboard() {
    return {
      totalProfiles: memoryProfiles.length,
      pendingProfiles: memoryProfiles.filter(p => p.status === 'PENDING').length,
      approvedProfiles: memoryProfiles.filter(p => p.status === 'APPROVED').length,
      rejectedProfiles: memoryProfiles.filter(p => p.status === 'REJECTED').length,
      totalUsers: memoryUsers.length,
      totalViews: memoryProfiles.reduce((acc, p) => acc + p.viewCount, 0),
    };
  },

  async getPendingProfiles() {
    return memoryProfiles.filter(p => p.status === 'PENDING');
  },

  async approveProfile(id: string) {
    const profile = memoryProfiles.find(p => p._id === id);
    if (!profile) return null;
    profile.status = 'APPROVED';
    profile.updatedAt = new Date().toISOString();
    return profile;
  },

  async rejectProfile(id: string) {
    const profile = memoryProfiles.find(p => p._id === id);
    if (!profile) return null;
    profile.status = 'REJECTED';
    profile.updatedAt = new Date().toISOString();
    return profile;
  },

  async featureProfile(id: string) {
    const profile = memoryProfiles.find(p => p._id === id);
    if (!profile) return null;
    profile.isFeatured = !profile.isFeatured;
    profile.updatedAt = new Date().toISOString();
    return profile;
  },

  async adminDeleteProfile(id: string) {
    const idx = memoryProfiles.findIndex(p => p._id === id);
    if (idx === -1) return false;
    memoryProfiles.splice(idx, 1);
    return true;
  }
};

export const metadataService = {
  getCategories() {
    return memoryCategories;
  },
  getRegions() {
    return memoryRegions;
  },
  searchGlobal(query: string) {
    if (!query) return { profiles: [], categories: [] };
    const q = query.toLowerCase();
    const matchedProfiles = memoryProfiles.filter(p =>
      p.status === 'APPROVED' && (
        p.name.toLowerCase().includes(q) ||
        p.founder.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.productService.toLowerCase().includes(q)
      )
    );
    const matchedCategories = memoryCategories.filter(c => c.name.toLowerCase().includes(q));
    return { profiles: matchedProfiles, categories: matchedCategories };
  }
};
