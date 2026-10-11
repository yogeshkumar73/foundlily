import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth';
import { profilesService } from '../profiles';
import { calculateTrendingScore } from '../../services/rankingService';

interface FollowRecord {
  _id: string;
  userId: string;
  profileId: string;
  createdAt: string;
}

interface SavedRecord {
  _id: string;
  userId: string;
  profileId: string;
  createdAt: string;
}

let followsStore: FollowRecord[] = [];
let savedStore: SavedRecord[] = [];

export const socialService = {
  follow(userId: string, profileId: string) {
    const profile = profilesService.getById(profileId);
    if (!profile) throw new Error('Profile not found');

    const exists = followsStore.find(f => f.userId === userId && f.profileId === profileId);
    if (!exists) {
      followsStore.push({
        _id: `fol-${Date.now()}`,
        userId,
        profileId,
        createdAt: new Date().toISOString(),
      });
      profile.followerCount += 1;
      profile.trendingScore = calculateTrendingScore(profile);
    }
    return { followerCount: profile.followerCount, followed: true };
  },

  unfollow(userId: string, profileId: string) {
    const profile = profilesService.getById(profileId);
    if (!profile) throw new Error('Profile not found');

    const idx = followsStore.findIndex(f => f.userId === userId && f.profileId === profileId);
    if (idx !== -1) {
      followsStore.splice(idx, 1);
      profile.followerCount = Math.max(0, profile.followerCount - 1);
      profile.trendingScore = calculateTrendingScore(profile);
    }
    return { followerCount: profile.followerCount, followed: false };
  },

  save(userId: string, profileId: string) {
    const profile = profilesService.getById(profileId);
    if (!profile) throw new Error('Profile not found');

    const exists = savedStore.find(s => s.userId === userId && s.profileId === profileId);
    if (!exists) {
      savedStore.push({
        _id: `sav-${Date.now()}`,
        userId,
        profileId,
        createdAt: new Date().toISOString(),
      });
      profile.saveCount += 1;
      profile.trendingScore = calculateTrendingScore(profile);
    }
    return { saveCount: profile.saveCount, saved: true };
  },

  unsave(userId: string, profileId: string) {
    const profile = profilesService.getById(profileId);
    if (!profile) throw new Error('Profile not found');

    const idx = savedStore.findIndex(s => s.userId === userId && s.profileId === profileId);
    if (idx !== -1) {
      savedStore.splice(idx, 1);
      profile.saveCount = Math.max(0, profile.saveCount - 1);
      profile.trendingScore = calculateTrendingScore(profile);
    }
    return { saveCount: profile.saveCount, saved: false };
  },

  getSavedProfiles(userId: string) {
    const savedIds = savedStore.filter(s => s.userId === userId).map(s => s.profileId);
    return profilesService.getStore().filter(p => savedIds.includes(p._id));
  }
};

export const socialController = {
  follow(req: AuthenticatedRequest, res: Response) {
    try {
      return res.json(socialService.follow(req.user!.userId, req.params.id));
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  unfollow(req: AuthenticatedRequest, res: Response) {
    try {
      return res.json(socialService.unfollow(req.user!.userId, req.params.id));
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  save(req: AuthenticatedRequest, res: Response) {
    try {
      return res.json(socialService.save(req.user!.userId, req.params.id));
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  unsave(req: AuthenticatedRequest, res: Response) {
    try {
      return res.json(socialService.unsave(req.user!.userId, req.params.id));
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  getSavedProfiles(req: AuthenticatedRequest, res: Response) {
    return res.json(socialService.getSavedProfiles(req.user!.userId));
  }
};

export const socialRouter = Router();
socialRouter.post('/:id/follow', authMiddleware, socialController.follow);
socialRouter.delete('/:id/follow', authMiddleware, socialController.unfollow);
socialRouter.post('/:id/save', authMiddleware, socialController.save);
socialRouter.delete('/:id/save', authMiddleware, socialController.unsave);
