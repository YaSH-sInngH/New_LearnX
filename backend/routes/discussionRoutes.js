import express from 'express';
import { 
  createDiscussion,
  getTrackDiscussions,
  updateDiscussion,
  deleteDiscussion,
  getModuleDiscussions,
  editDiscussion,
  uploadAttachment
} from '../controllers/discussionController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for attachments
  }
});

router.use((req, res, next) => {
  console.log('Discussions route hit:', req.method, req.originalUrl, req.params);
  next();
});

// Create new discussion (with optional attachment)
router.post('/attachment', 
  authenticate, 
  upload.single('attachment'), 
  uploadAttachment
);

// Get all discussions for a track
router.get('/tracks/:trackId', authenticate, getTrackDiscussions);

// Get all discussions for a module
router.get('/module/:moduleId', authenticate, getModuleDiscussions);

// Update discussion (author only)
router.put('/:discussionId', authenticate, updateDiscussion);

// Delete discussion (author or admin)
router.delete('/:id', 
  authenticate, 
  deleteDiscussion
);

// Create a new message
router.post('/', authenticate, createDiscussion);

// Edit a message
router.put('/:id', authenticate, editDiscussion);


// Get discussions for a track
router.get('/track/:trackId', authenticate, getTrackDiscussions);

// Delete discussion (author or admin)
router.delete('/:id', authenticate, deleteDiscussion);

export default router;