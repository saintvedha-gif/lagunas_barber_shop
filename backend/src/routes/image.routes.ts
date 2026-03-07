import { Router, Request, Response } from 'express';
import { ImageFile } from '../models/ImageFile';

const router = Router();

// GET /api/images/:id  — sirve el binario con cache agresivo
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  console.log('[GET /api/images/:id] Solicitado:', req.params['id']);
  try {
    const img = await ImageFile.findById(req.params['id']).lean();
    if (!img) {
      console.log('[GET /api/images/:id] NO encontrada en DB');
      res.status(404).json({ error: 'Imagen no encontrada.' });
      return;
    }

    console.log('[GET /api/images/:id] Encontrada:', { contentType: img.contentType, size: img.size, dataType: typeof img.data, hasData: !!img.data });
    res.set({
      'Content-Type':  img.contentType,
      'Content-Length': String(img.size),
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 año
    });
    res.send(img.data);
  } catch (err) {
    console.error('[GET /api/images/:id] Error:', err);
    res.status(404).json({ error: 'Imagen no encontrada.' });
  }
});

export default router;
