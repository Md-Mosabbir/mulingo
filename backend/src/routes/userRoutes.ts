import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { getUserProfile, listOrSearchUsers, updateMyProfile } from '../controllers/userController';
import { authenticateJWT } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { searchLimiter } from '../middleware/security';

const router = Router();

router.get(
  '/',
  authenticateJWT,
  searchLimiter,
  query('q').optional().isString().withMessage('q must be a string'),
  query('username').optional().isString().withMessage('username must be a string'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  validate,
  listOrSearchUsers,
);

router.get(
  '/:id',
  authenticateJWT,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  validate,
  getUserProfile,
);

router.put(
  '/:id',
  authenticateJWT,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  body('display_name').optional().isString().isLength({ min: 1, max: 100 }).withMessage('display_name must be 1-100 chars'),
  body('preferred_language_code').optional().isString().isLength({ min: 2, max: 10 }).withMessage('preferred_language_code must be 2-10 chars'),
  body('preferred_language_id').optional().isInt({ min: 1 }).withMessage('preferred_language_id must be a positive integer'),
  body('avatar_url').optional().isString().isLength({ min: 1, max: 500 }).withMessage('avatar_url must be 1-500 chars'),
  validate,
  updateMyProfile,
);

export default router;

