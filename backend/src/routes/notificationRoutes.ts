import { Router } from 'express';
import { subscribeUser, unsubscribeUser } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/subscribe', authenticateToken, subscribeUser);
router.post('/unsubscribe', authenticateToken, unsubscribeUser);

export default router;
