import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
} from '../controllers/notificationController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.get('/', authenticate, getUserNotifications);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/mark-all-read', authenticate, markAllAsRead);
router.delete('/:id', authenticate, deleteNotification);

// Admin-only route
router.post('/:userId', authenticate, authorize(['Admin']), createNotification);

export default router;