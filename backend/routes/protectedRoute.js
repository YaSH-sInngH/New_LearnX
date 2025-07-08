import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route for all authenticated users
// router.get('/profile', authenticate, (req, res) => {
//   res.json({ message: 'Profile data' });
// });

// Admin-only route
router.get('/admin', authenticate, authorize('Admin'), (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

// Creator-only route
router.get('/creator', authenticate, authorize('Creator'), (req, res) => {
  res.json({ message: 'Creator dashboard' });
});

export default router