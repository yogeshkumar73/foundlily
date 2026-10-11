import { Router } from 'express';
import { authRouter } from '../modules/auth';
import { profilesRouter, profilesController } from '../modules/profiles';
import { socialRouter, socialController } from '../modules/social';
import { adminRouter } from '../modules/admin';
import { metadataRouter } from '../modules/metadata';
import { analyticsRouter, analyticsController } from '../modules/analytics';
import { uploadRouter, serveImageHandler } from '../modules/upload';
import { authMiddleware } from '../middleware/auth';

export const apiRouter = Router();

// Module: Dynamic Image Upload & Serving
apiRouter.use('/upload', uploadRouter);
apiRouter.get('/images/:filename', serveImageHandler);

// Module: Auth
apiRouter.use('/auth', authRouter);

// Module: Metadata (Categories, Regions, Global Search)
apiRouter.use('/', metadataRouter);

// Module: Profiles (Public & CRUD)
apiRouter.get('/trending', profilesController.getTrending);
apiRouter.get('/public/profiles/:slug', profilesController.getPublicProfile);
apiRouter.use('/profiles', profilesRouter);

// Module: User Profile Views
apiRouter.get('/user/profiles', authMiddleware, profilesController.getUserProfiles);
apiRouter.get('/user/saved', authMiddleware, socialController.getSavedProfiles);

// Module: Social (Follow / Save)
apiRouter.use('/profiles', socialRouter);

// Module: Analytics
apiRouter.use('/analytics', analyticsRouter);

// Module: Admin Management
apiRouter.use('/admin', adminRouter);

// Module: AI Pitch Review
apiRouter.post('/ai/pitch-review', authMiddleware, analyticsController.pitchReview);
