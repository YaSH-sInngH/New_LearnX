import express from 'express';
import { 
  getLeaderboard,
  getUserProgress,
  getTrackLeaderboard
} from '../controllers/gamificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/progress', authenticate, getUserProgress);
router.get('/leaderboard/:trackId', authenticate, getTrackLeaderboard);

export default router;