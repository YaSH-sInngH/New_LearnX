import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { 
  getProfile, 
  updateProfile, 
  uploadAvatar,
  getXPHistory
} from '../controllers/profileController.js';

import multer from 'multer';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, or WebP images are allowed'));
      }
    }
  });

// GOOD: static first
router.get('/xp-history', authenticate, getXPHistory);

// Public profile view (by userId)
router.get('/:userId', getProfile);

// Protected routes (must be after public route)
router.use(authenticate);

// Get own profile
router.get('/', getProfile);

// Update own profile
router.put('/', updateProfile);

// Upload avatar
router.post('/avatar', upload.single('avatar'), uploadAvatar);

export default router;