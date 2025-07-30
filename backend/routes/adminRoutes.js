import express from 'express';
import { 
  getAllUsers,
  updateUserRole,
  getPlatformStats,
  manageTrack,
  getAllTracks,
  updateUserStatus,
  generateInvitationCode,
  getInvitationCodes,
  deleteInvitationCode
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate, authorize(['Admin']));

router.get('/users', getAllUsers);
router.patch('/users/:userId/role', updateUserRole);
router.patch('/users/:userId/status', updateUserStatus);
router.get('/stats', getPlatformStats);
router.post('/tracks/:trackId/manage', manageTrack);
router.get('/tracks',authenticate, authorize(['Admin']),getAllTracks);

// Admin invitation code routes
router.post('/invitation-codes', generateInvitationCode);
router.get('/invitation-codes', getInvitationCodes);
router.delete('/invitation-codes/:id', deleteInvitationCode);

export default router;