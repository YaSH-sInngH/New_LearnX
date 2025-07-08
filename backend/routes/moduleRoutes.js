import express from 'express';
import { 
  addModule,
  updateModule,
  deleteModule,
  getModuleWithQuiz,
  uploadModuleVideo,
  getVideoStatus,
  updateVideoDuration,
} from '../controllers/moduleController.js';
import { submitQuiz, getQuizAttempts, generateAIQuiz } from '../controllers/quizController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import multer from 'multer';

const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

const router = express.Router();

router.post('/tracks/:trackId/modules', authenticate, authorize('Creator'), addModule);
router.put('/:moduleId', authenticate, authorize('Creator'), updateModule);
router.delete('/:moduleId', authenticate, authorize('Creator'), deleteModule);
router.get('/:moduleId', authenticate, getModuleWithQuiz);
router.post(
    '/:moduleId/video', 
    authenticate, 
    authorize('Creator'), 
    videoUpload.single('video'), 
    uploadModuleVideo
  );
  
  router.get(
    '/:moduleId/video-status', 
    authenticate, 
    getVideoStatus
  );

  router.post('/:moduleId/quiz', authenticate, submitQuiz);
  router.get('/:moduleId/quiz/attempts', authenticate, getQuizAttempts);
  router.post('/:moduleId/quiz/ai-generate', authenticate, authorize('Creator'), generateAIQuiz);

  // Route to update video duration
  router.patch('/:moduleId/duration', authenticate, async (req, res) => {
    try {
      const { duration } = req.body;
      await updateVideoDuration(req.params.moduleId, duration);
      res.json({ message: 'Duration updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update duration' });
    }
  });

export default router;