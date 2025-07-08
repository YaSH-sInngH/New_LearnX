import express from 'express';
import { 
  createTrack,
  uploadTrackCover,
  getTrackAnalytics,
  enrollInTrack,
  searchTracks,
  updateTrack,
  deleteTrack,
  getCreatorTracks,
  getTrackById,
  getEnrolledTracks
} from '../controllers/trackController.js';
import { saveModuleProgress, getTrackProgress } from '../controllers/progressController.js';
import { createReview, getTrackReviews } from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Track CRUD
router.post('/', authenticate, authorize('Creator'), createTrack);
router.get('/creator', authenticate, authorize('Creator'), getCreatorTracks);
router.get('/enrolled', authenticate, getEnrolledTracks);
router.get('/search', searchTracks);
router.get('/:trackId', getTrackById);
router.put('/:trackId', authenticate, authorize('Creator'), updateTrack);
router.post('/:trackId/cover', authenticate, upload.single('cover'), uploadTrackCover);
router.delete('/:trackId', authenticate, authorize('Creator'), deleteTrack);

// Enrollment
router.post('/:trackId/enroll', authenticate, enrollInTrack);

// Analytics
router.get('/:trackId/analytics', authenticate, authorize(['Creator']), getTrackAnalytics);

router.post('/:trackId/reviews', authenticate, createReview);
router.get('/:trackId/reviews', getTrackReviews);

router.post('/:trackId/progress', authenticate, saveModuleProgress);
router.get('/:trackId/progress', authenticate, getTrackProgress);


export default router;