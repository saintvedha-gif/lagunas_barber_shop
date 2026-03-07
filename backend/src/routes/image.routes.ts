import { Router, Request, Response } from 'express';
import { ImageFile } from '../models/ImageFile';

const router = Router();

// GET /api/images/:id  — sirve el binario con cache agresivo
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const img = await ImageFile.findById(req.params['id']).lean();
    if (!img) { res.status(404).json({ error: 'Imagen no encontrada.' }); return; }

    res.set({
      'Content-Type':  img.contentType,
      'Content-Length': String(img.size),
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 año
    });
    res.send(img.data);
  } catch {
    res.status(404).json({ error: 'Imagen no encontrada.' });
  }
});

export default router;
