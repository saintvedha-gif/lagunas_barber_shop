import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getColors, createColor, updateColor, deleteColor } from '../controllers/color.controller';

const router = Router();

router.get('/',       getColors);
router.post('/',      requireAuth, createColor);
router.put('/:id',    requireAuth, updateColor);
router.delete('/:id', requireAuth, deleteColor);

export default router;
