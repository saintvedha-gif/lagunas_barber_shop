import { Router } from 'express';
import { getPublicSettings, upsertSetting } from '../controllers/settings.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/',          getPublicSettings);
router.put('/:clave',    requireAuth, upsertSetting);

export default router;
