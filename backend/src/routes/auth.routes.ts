import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, changePassword } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { error: 'Demasiados intentos de login. Intenta en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

router.post('/login',           loginLimiter, login);
router.post('/logout',          requireAuth,  logout);
router.post('/change-password', requireAuth,  changePassword);

export default router;
