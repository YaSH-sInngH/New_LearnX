import { Quiz, QuizAttempt, Module, Enrollment, Track, User } from '../models/index.js';
import { generateQuiz, generateQuizFromNotes } from '../services/aiService.js';
import { notifyQuizResult } from '../services/notificationService.js';
import axios from 'axios';
import { checkAchievements } from '../services/gamificationServices.js';

export const submitQuiz = async (req, res) => {
  try {
    const { moduleId, answers } = req.body;
    
    const module = await Module.findByPk(moduleId, {
      include: [{
        model: Quiz,
        as: 'quiz',
        required: true
      }, {
        model: Track,
        as: 'Track',
        attributes: ['id']
      }]
    });

    if (!module || !module.quiz) {
      return res.status(404).json({ error: 'Quiz not found for this module' });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.id,
        trackId: module.Track.id
      }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this track' });
    }

    // Grade the quiz
    const { score, passed, correctAnswers } = gradeQuiz(
      module.quiz.questions,
      answers,
      module.quiz.passingScore
    );

    // Record attempt
    const attempt = await QuizAttempt.create({
      answers,
      score,
      passed,
      userId: req.user.id,
      quizId: module.quiz.id,
      moduleId: module.id
    });

    // Update progress if passed
    if (passed) {
      // Call the main progress endpoint to ensure defensive logic is used
      try {
        const apiBase = process.env.API_BASE || 'http://localhost:6166/api';
        const progressRes = await axios.post(
          `${apiBase}/tracks/${module.Track.id}/progress`,
          {
            moduleId: module.id,
            completed: true,
            quizCompleted: true
          },
          {
            headers: {
              Authorization: req.headers['authorization'] || '',
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Called /tracks/:trackId/progress from quizController, response:', progressRes.data);
      } catch (progressErr) {
        console.error('Error calling /tracks/:trackId/progress from quizController:', progressErr.response?.data || progressErr.message);
      }
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId);

    // Example: 100 XP for passing a quiz
    let xpGained = 0;
    let newBadge = null;
    if (passed) {
      xpGained = 100;
      user.xp = (user.xp || 0) + xpGained;
      await user.save();
      // Check for new achievements
      const { newAchievements } = await checkAchievements(userId);
      if (newAchievements.length > 0) {
        newBadge = newAchievements[0]; // Return the first new badge for modal
      }
    }

    // Send notification
    try {
      await notifyQuizResult(userId, module.title, passed, score, xpGained);
    } catch (notificationError) {
      console.error('Failed to send quiz notification:', notificationError);
    }

    res.json({
      score,
      passed,
      correctAnswers,
      attemptId: attempt.id,
      xpGained,
      newBadge,
      xp: user.xp,
      badges: user.badges
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ error: 'Failed to submit quiz', details: error.message });
  }
};

const gradeQuiz = (questions, userAnswers, passingScore = 70) => {
  if (!Array.isArray(questions) || !Array.isArray(userAnswers)) {
    return { score: 0, passed: false, correctAnswers: [] };
  }
  const correctAnswers = questions.map((q, index) => q.correctAnswer === userAnswers[index]);
  const correctCount = correctAnswers.filter(Boolean).length;
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= passingScore;
  return { score, passed, correctAnswers };
};

export const getQuizAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.findAll({
      where: {
        userId: req.user.id,
        moduleId: req.params.moduleId
      },
      order: [['completedAt', 'DESC']],
      attributes: ['id', 'score', 'passed', 'completedAt']
    });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get attempts' });
  }
};

export const generateAIQuiz = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const module = await Module.findByPk(moduleId, {
      include: [{
        model: Track,
        as: 'Track',
        attributes: ['id', 'creatorId']
      }]
    });

    if (!module) return res.status(404).json({ error: 'Module not found' });
    if (module.Track.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to generate quiz for this module' });
    }
    if (!module.videoUrl && !module.notes) {
      return res.status(400).json({ error: 'Module must have either video content or notes to generate AI quiz' });
    }

    let quizData;
    if (module.notes && module.notes.trim().length > 10) {
      quizData = await generateQuizFromNotes(module.notes);
    } else if (module.videoUrl) {
      quizData = await generateQuiz(module.videoUrl, 'video');
    } else {
      throw new Error('Module must have either notes or video content to generate a quiz');
    }

    const quiz = await Quiz.create({
      questions: quizData.questions,
      passingScore: 70,
      moduleId: moduleId
    });
    await module.update({ quizId: quiz.id });

    res.json({
      message: 'Quiz generated successfully',
      quiz: {
        id: quiz.id,
        questions: quiz.questions,
        passingScore: quiz.passingScore
      }
    });
  } catch (error) {
    console.error('Hugging Face Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate AI quiz', details: error.message });
  }
};