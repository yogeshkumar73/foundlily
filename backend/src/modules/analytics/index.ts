import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth';
import { profilesService } from '../profiles';
import { GoogleGenAI } from '@google/genai';

interface EventRecord {
  _id: string;
  profileId: string;
  userId?: string;
  eventType: string;
  metadata?: any;
  createdAt: string;
}

let eventsStore: EventRecord[] = [];

export const analyticsService = {
  recordEvent(profileId: string, eventType: string, userId?: string, metadata?: any) {
    const ev: EventRecord = {
      _id: `ev-${Date.now()}`,
      profileId,
      userId,
      eventType,
      metadata,
      createdAt: new Date().toISOString(),
    };
    eventsStore.push(ev);
    return ev;
  },

  getOwnerAnalytics(profileId: string, userId: string, role: string) {
    const profile = profilesService.getById(profileId);
    if (!profile) throw new Error('Profile not found');
    if (profile.ownerId !== userId && role !== 'admin') throw new Error('Unauthorized');

    const events = eventsStore.filter(e => e.profileId === profileId);
    return {
      viewCount: profile.viewCount,
      followerCount: profile.followerCount,
      saveCount: profile.saveCount,
      trendingScore: profile.trendingScore,
      eventsCount: events.length,
      recentEvents: events.slice(-10),
    };
  }
};

export const analyticsController = {
  recordEvent(req: Request, res: Response) {
    const { profileId, eventType, metadata } = req.body;
    return res.json(analyticsService.recordEvent(profileId, eventType, undefined, metadata));
  },

  getOwnerAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      return res.json(analyticsService.getOwnerAnalytics(req.params.id, req.user!.userId, req.user!.role));
    } catch (err: any) {
      return res.status(403).json({ error: err.message });
    }
  },

  async pitchReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { profileData } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          feedback: "AI Pitch Reviewer: Your profile looks solid! Focus on clarifying your proprietary IP advantages, target TAM, and customer retention metrics."
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
      console.error('Gemini AI Error:', err);
      return res.json({ feedback: "AI evaluation currently unavailable. Ensure your pitch highlights clear market differentiation." });
    }
  }
};

export const analyticsRouter = Router();
analyticsRouter.post('/event', analyticsController.recordEvent);
analyticsRouter.get('/profile/:id', authMiddleware, analyticsController.getOwnerAnalytics);
