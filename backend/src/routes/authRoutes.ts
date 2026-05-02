import { Router } from 'express';
import { googleLogin } from '../controllers/authController';
import { authLimiter } from '../middleware/security';

const router = Router();

router.post('/login', authLimiter, googleLogin);

export default router;

