import { Router } from 'express';
import { param, query } from 'express-validator';
import { authenticateJWT } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getChatAggregateStats,
  getChatsUsingInSubquery,
  getDistinctSenders,
  getMyChatOverviewFromView,
} from '../controllers/reportController';

const router = Router();

// Multi-row subquery with IN
router.get(
  '/chats-in-subquery',
  authenticateJWT,
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('limit must be 1-200'),
  validate,
  getChatsUsingInSubquery,
);

// DISTINCT
router.get(
  '/chats/:chatId/distinct-senders',
  authenticateJWT,
  param('chatId').isInt({ min: 1 }).withMessage('chatId must be a positive integer'),
  validate,
  getDistinctSenders,
);

// Aggregates + GROUP BY + HAVING
router.get(
  '/chats/:chatId/aggregate-stats',
  authenticateJWT,
  param('chatId').isInt({ min: 1 }).withMessage('chatId must be a positive integer'),
  query('minCount').optional().isInt({ min: 1, max: 1000000 }).withMessage('minCount must be a positive integer'),
  validate,
  getChatAggregateStats,
);

// VIEW usage
router.get(
  '/my-chat-overview-view',
  authenticateJWT,
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('limit must be 1-200'),
  validate,
  getMyChatOverviewFromView,
);

export default router;

