import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticateJWT } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  addMember,
  banMember,
  changeMemberRole,
  createGroup,
  getGroup,
  listGroups,
  muteMember,
  removeMember,
  unbanMember,
  unmuteMember,
  updateGroup,
} from '../controllers/groupController';
import { getGroupMessages } from '../controllers/messageController';

const router = Router();

router.post(
  '/',
  authenticateJWT,
  body('name').isString().isLength({ min: 1, max: 150 }).withMessage('name must be 1-150 chars'),
  body('description').optional().isString().isLength({ max: 500 }).withMessage('description too long'),
  body('image_url').optional().isString().isLength({ max: 500 }).withMessage('image_url too long'),
  validate,
  createGroup,
);

router.get('/', authenticateJWT, listGroups);

router.get(
  '/:id',
  authenticateJWT,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  validate,
  getGroup,
);

router.get(
  '/:id/messages',
  authenticateJWT,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  query('cursor').optional().isInt({ min: 1 }).withMessage('cursor must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  validate,
  getGroupMessages,
);

router.put(
  '/:id',
  authenticateJWT,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  body('name').optional().isString().isLength({ min: 1, max: 150 }).withMessage('name must be 1-150 chars'),
  body('description').optional().isString().isLength({ max: 500 }).withMessage('description too long'),
  body('image_url').optional().isString().isLength({ max: 500 }).withMessage('image_url too long'),
  validate,
  updateGroup,
);

router.post(
  '/:id/members',
  authenticateJWT,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  body('user_id').isInt({ min: 1 }).withMessage('user_id must be a positive integer'),
  validate,
  addMember,
);

router.delete(
  '/:id/members/:userId',
  authenticateJWT,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  param('userId').isInt({ min: 1 }).withMessage('userId must be a positive integer'),
  validate,
  removeMember,
);

router.post(
  '/:id/members/:userId/mute',
  authenticateJWT,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  param('userId').isInt({ min: 1 }).withMessage('userId must be a positive integer'),
  body('duration_minutes').optional().isInt({ min: 1, max: 525600 }).withMessage('duration_minutes must be a positive integer'),
  validate,
  muteMember,
);

router.delete(
  '/:id/members/:userId/mute',
  authenticateJWT,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  param('userId').isInt({ min: 1 }).withMessage('userId must be a positive integer'),
  validate,
  unmuteMember,
);

router.post(
  '/:id/members/:userId/ban',
  authenticateJWT,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  param('userId').isInt({ min: 1 }).withMessage('userId must be a positive integer'),
  validate,
  banMember,
);

router.delete(
  '/:id/members/:userId/ban',
  authenticateJWT,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  param('userId').isInt({ min: 1 }).withMessage('userId must be a positive integer'),
  validate,
  unbanMember,
);

router.put(
  '/:id/members/:userId/role',
  authenticateJWT,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  param('userId').isInt({ min: 1 }).withMessage('userId must be a positive integer'),
  body('role').isString().isLength({ min: 3, max: 20 }).withMessage('role is required'),
  validate,
  changeMemberRole,
);

export default router;

