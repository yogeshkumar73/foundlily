import { Router, Request, Response } from 'express';
import { adminMiddleware, AuthenticatedRequest } from '../../middleware/auth';
import { profilesService } from '../profiles';
import { authService } from '../auth';

export const adminService = {
  getDashboard() {
    const profiles = profilesService.getStore();
    return {
      totalProfiles: profiles.length,
      pendingProfiles: profiles.filter(p => p.status === 'PENDING').length,
      approvedProfiles: profiles.filter(p => p.status === 'APPROVED').length,
      rejectedProfiles: profiles.filter(p => p.status === 'REJECTED').length,
      totalUsers: authService.getAllUsersCount(),
      totalViews: profiles.reduce((acc, p) => acc + p.viewCount, 0),
    };
  },

  getPendingProfiles() {
    return profilesService.getStore().filter(p => p.status === 'PENDING');
  },

  approve(id: string) {
    const profile = profilesService.getStore().find(p => p._id === id);
    if (!profile) return null;
    profile.status = 'APPROVED';
    profile.updatedAt = new Date().toISOString();
    return profile;
  },

  reject(id: string) {
    const profile = profilesService.getStore().find(p => p._id === id);
    if (!profile) return null;
    profile.status = 'REJECTED';
    profile.updatedAt = new Date().toISOString();
    return profile;
  },

  feature(id: string) {
    const profile = profilesService.getStore().find(p => p._id === id);
    if (!profile) return null;
    profile.isFeatured = !profile.isFeatured;
    profile.updatedAt = new Date().toISOString();
    return profile;
  },

  delete(id: string) {
    const idx = profilesService.getStore().findIndex(p => p._id === id);
    if (idx === -1) return false;
    profilesService.getStore().splice(idx, 1);
    return true;
  }
};

export const adminController = {
  getDashboard(req: AuthenticatedRequest, res: Response) {
    return res.json(adminService.getDashboard());
  },

  getPendingProfiles(req: AuthenticatedRequest, res: Response) {
    return res.json(adminService.getPendingProfiles());
  },

  approve(req: AuthenticatedRequest, res: Response) {
    const result = adminService.approve(req.params.id);
    if (!result) return res.status(404).json({ error: 'Profile not found' });
    return res.json(result);
  },

  reject(req: AuthenticatedRequest, res: Response) {
    const result = adminService.reject(req.params.id);
    if (!result) return res.status(404).json({ error: 'Profile not found' });
    return res.json(result);
  },

  feature(req: AuthenticatedRequest, res: Response) {
    const result = adminService.feature(req.params.id);
    if (!result) return res.status(404).json({ error: 'Profile not found' });
    return res.json(result);
  },

  delete(req: AuthenticatedRequest, res: Response) {
    const success = adminService.delete(req.params.id);
    if (!success) return res.status(404).json({ error: 'Profile not found' });
    return res.json({ success: true });
  }
};

export const adminRouter = Router();
adminRouter.use(adminMiddleware);
adminRouter.get('/dashboard', adminController.getDashboard);
adminRouter.get('/profiles/pending', adminController.getPendingProfiles);
adminRouter.patch('/profiles/:id/approve', adminController.approve);
adminRouter.patch('/profiles/:id/reject', adminController.reject);
adminRouter.patch('/profiles/:id/feature', adminController.feature);
adminRouter.delete('/profiles/:id', adminController.delete);
