import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { uploadBarberMedia, uploadServiceImage } from '../middleware/upload';
import {
  getServices, createService, updateService, deleteService,
  getMedia, createMedia, deleteMedia,
} from '../controllers/barber.controller';

const router = Router();

router.get('/services',        getServices);
router.post('/services',       requireAuth, (req, res, next) => {
  uploadServiceImage(req, res, (err) => {
    if (err) { res.status(400).json({ error: (err as Error).message }); return; }
    next();
  });
}, createService);
router.put('/services/:id',    requireAuth, (req, res, next) => {
  uploadServiceImage(req, res, (err) => {
    if (err) { res.status(400).json({ error: (err as Error).message }); return; }
    next();
  });
}, updateService);
router.delete('/services/:id', requireAuth, deleteService);

router.get('/media',           getMedia);
router.post('/media', requireAuth, (req, res, next) => {
  uploadBarberMedia(req, res, (err) => {
    if (err) { res.status(400).json({ error: (err as Error).message }); return; }
    next();
  });
}, createMedia);
router.delete('/media/:id',    requireAuth, deleteMedia);

export default router;
