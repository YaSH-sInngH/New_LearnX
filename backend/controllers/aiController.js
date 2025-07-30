import { Module, Track, Enrollment, AIQuestion, User } from '../models/index.js';
import { askQuestion } from '../services/aiService.js';
import { extractTranscript } from '../services/videoService.js';

export const askAI = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { question } = req.body;

    if (!question || question.trim().length < 3) {
      return res.status(400).json({ error: 'Question must be at least 3 characters long' });
    }

    // Get module with track info
    const module = await Module.findByPk(moduleId, {
      include: [{
        model: Track,
        as: 'Track',
        attributes: ['id', 'title', 'creatorId']
      }]
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
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

    // Get transcript if video exists
    let transcript = null;
    if (module.videoUrl) {
      try {
        transcript = await extractTranscript(module.videoUrl);
      } catch (error) {
        console.warn('Failed to extract transcript:', error);
        // Continue without transcript
      }
    }

    // Prepare module data for AI
    const moduleData = {
      notes: module.notes || '',
      transcript: transcript || '',
      title: module.title
    };

    // Generate AI response
    const aiResponse = await askQuestion(question, moduleData);

    // Save the Q&A for future reference
    const savedQuestion = await AIQuestion.create({
      question: question.trim(),
      answer: aiResponse.answer,
      citations: aiResponse.citations,
      moduleId: moduleId,
      userId: req.user.id,
      trackId: module.Track.id,
      sourceType: aiResponse.citations.some(c => c.source === 'transcript') && aiResponse.citations.some(c => c.source === 'notes') 
        ? 'both' 
        : aiResponse.citations[0]?.source || 'notes',
      relevanceScore: aiResponse.citations.length > 0 ? 
        aiResponse.citations.reduce((sum, c) => sum + c.relevance, 0) / aiResponse.citations.length : 0
    });

    res.json({
      id: savedQuestion.id,
      question: savedQuestion.question,
      answer: savedQuestion.answer,
      citations: savedQuestion.citations,
      sourceType: savedQuestion.sourceType,
      createdAt: savedQuestion.createdAt
    });

  } catch (error) {
    console.error('AI ask error:', error);
    res.status(500).json({ 
      error: 'Failed to process question', 
      details: error.message 
    });
  }
};

export const getModuleQuestions = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Check if user is enrolled in the track
    const module = await Module.findByPk(moduleId, {
      include: [{
        model: Track,
        as: 'Track',
        attributes: ['id']
      }]
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.id,
        trackId: module.Track.id
      }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this track' });
    }

    // Get questions for this module
    const questions = await AIQuestion.findAndCountAll({
      where: { moduleId, userId: req.user.id },
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatarUrl']
      }]
    });

    res.json({
      total: questions.count,
      questions: questions.rows
    });

  } catch (error) {
    console.error('Get module questions error:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const getUserQuestions = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const questions = await AIQuestion.findAndCountAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Module,
          as: 'module',
          attributes: ['id', 'title', 'order']
        },
        {
          model: Track,
          as: 'track',
          attributes: ['id', 'title']
        }
      ]
    });

    res.json({
      total: questions.count,
      questions: questions.rows
    });

  } catch (error) {
    console.error('Get user questions error:', error);
    res.status(500).json({ error: 'Failed to fetch user questions' });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await AIQuestion.findByPk(questionId);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Only allow user to delete their own questions
    if (question.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this question' });
    }

    await question.destroy();

    res.json({ message: 'Question deleted successfully' });

  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

// Test endpoint to set module notes (for testing purposes)
export const setModuleNotes = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ error: 'Notes are required' });
    }

    const module = await Module.findByPk(moduleId);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Update module notes
    await module.update({ notes });

    res.json({ 
      message: 'Module notes updated successfully',
      moduleId,
      notesLength: notes.length
    });

  } catch (error) {
    console.error('Set module notes error:', error);
    res.status(500).json({ error: 'Failed to update module notes' });
  }
}; 