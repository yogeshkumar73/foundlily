import { Router, Request, Response } from 'express';
import { initialCategories, initialRegions } from '../../services/seedData';
import { profilesService } from '../profiles';

export const metadataService = {
  getCategories() {
    return initialCategories;
  },
  getRegions() {
    return initialRegions;
  },
  searchGlobal(query: string) {
    if (!query) return { profiles: [], categories: [] };
    const q = query.toLowerCase();
    const matchedProfiles = profilesService.getStore().filter(p =>
      p.status === 'APPROVED' && (
        p.name.toLowerCase().includes(q) ||
        p.founder.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.productService.toLowerCase().includes(q)
      )
    );
    const matchedCategories = initialCategories.filter(c => c.name.toLowerCase().includes(q));
    return { profiles: matchedProfiles, categories: matchedCategories };
  }
};

export const metadataController = {
  getCategories(req: Request, res: Response) {
    return res.json(metadataService.getCategories());
  },
  getRegions(req: Request, res: Response) {
    return res.json(metadataService.getRegions());
  },
  searchGlobal(req: Request, res: Response) {
    const q = (req.query.q as string) || '';
    return res.json(metadataService.searchGlobal(q));
  }
};

export const metadataRouter = Router();
metadataRouter.get('/categories', metadataController.getCategories);
metadataRouter.get('/regions', metadataController.getRegions);
metadataRouter.get('/search', metadataController.searchGlobal);
