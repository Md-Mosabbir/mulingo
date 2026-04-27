import { Router } from 'express';
import { googleLogin } from '../controllers/authController';

const router = Router();

router.post('/login', googleLogin);

export default router;

