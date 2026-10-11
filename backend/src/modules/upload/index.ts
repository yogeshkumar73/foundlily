import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { isDbConnected } from '../../lib/db';
import { ImageModel } from '../../models';

interface StoredImage {
  id: string;
  filename: string;
  contentType: string;
  buffer: Buffer;
  base64: string;
  createdAt: Date;
}

const imagesCache = new Map<string, StoredImage>();

export const uploadRouter = Router();

uploadRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Image data is required' });
    }

    let contentType = 'image/png';
    let base64Data = image;

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        contentType = match[1];
        base64Data = match[2];
      }
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const id = `img_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' 
      : contentType.includes('svg') ? 'svg' 
      : contentType.includes('webp') ? 'webp' 
      : 'png';
    const filename = `${id}.${ext}`;

    const stored: StoredImage = {
      id,
      filename,
      contentType,
      buffer,
      base64: base64Data,
      createdAt: new Date(),
    };

    imagesCache.set(id, stored);

    // Sync to MongoDB if connected
    if (isDbConnected()) {
      try {
        await (ImageModel as any).create({
          imageId: id,
          filename,
          contentType,
          dataBase64: base64Data,
        });
      } catch (err) {
        console.warn('[Upload] DB sync image notice:', err);
      }
    }

    const url = `/api/images/${filename}`;

    return res.json({
      success: true,
      url,
      id,
      filename,
      contentType,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Image processing failed' });
  }
});

export async function serveImageHandler(req: Request, res: Response) {
  try {
    const filename = req.params.filename;
    const id = filename.split('.')[0];

    let cached = imagesCache.get(id);

    if (!cached && isDbConnected()) {
      try {
        const doc = await (ImageModel as any).findOne({ imageId: id });
        if (doc) {
          cached = {
            id: doc.imageId,
            filename: doc.filename,
            contentType: doc.contentType,
            buffer: Buffer.from(doc.dataBase64, 'base64'),
            base64: doc.dataBase64,
            createdAt: doc.createdAt,
          };
          imagesCache.set(id, cached);
        }
      } catch (err) {
        console.warn('[Upload] DB fetch image notice:', err);
      }
    }

    if (cached) {
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(cached.buffer);
    }

    // Fallback: Redirect to dicebear identicon SVG
    return res.redirect(`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(id)}`);
  } catch (err: any) {
    return res.status(404).send('Image not found');
  }
}
