import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { llmLimiter } from '../middleware/security';
import { llmTestValidation, testTranslation } from '../controllers/llmController';

const router = Router();

router.post('/test-translation', authenticateJWT, llmLimiter, llmTestValidation, testTranslation);

export default router;

