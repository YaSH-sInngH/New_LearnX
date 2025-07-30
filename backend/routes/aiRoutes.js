import express from 'express';
import { askAI, getModuleQuestions, getUserQuestions, deleteQuestion, setModuleNotes } from '../controllers/aiController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Ask AI a question about a module
router.post('/ask/:moduleId', askAI);

// Get questions for a specific module
router.get('/questions/:moduleId', getModuleQuestions);

// Get user's questions across all modules
router.get('/questions', getUserQuestions);

// Delete a question (only by the user who asked it)
router.delete('/questions/:questionId', deleteQuestion);

// Test endpoint to set module notes (for testing purposes)
router.post('/test/set-notes/:moduleId', setModuleNotes);

export default router; 