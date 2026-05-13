import { Router } from 'express';
import { subscribeUser, unsubscribeUser } from '../controllers/notificationController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/subscribe', authenticateJWT, subscribeUser);
router.post('/unsubscribe', authenticateJWT, unsubscribeUser);

export default router;
