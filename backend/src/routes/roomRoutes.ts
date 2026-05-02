import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticateJWT } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrGetDmRoom, getRoom, listMyRooms } from '../controllers/roomController';
import { getRoomMessages } from '../controllers/messageController';

const router = Router();

router.post(
  '/',
  authenticateJWT,
  body('other_user_id').isInt({ min: 1 }).withMessage('other_user_id must be a positive integer'),
  validate,
  createOrGetDmRoom,
);

router.get('/', authenticateJWT, listMyRooms);

router.get(
  '/:id',
  authenticateJWT,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  validate,
  getRoom,
);

router.get(
  '/:id/messages',
  authenticateJWT,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  query('cursor').optional().isInt({ min: 1 }).withMessage('cursor must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  validate,
  getRoomMessages,
);

export default router;

