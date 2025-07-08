  import { Track, Module, Enrollment, Discussion, Quiz, User, QuizAttempt } from '../models/index.js';
  import { supabase } from '../services/supabase.js';
  import sharp from 'sharp';
  import { Op } from 'sequelize';
  import { sequelize } from '../config/database.js';
  import { notifyNewEnrollment } from '../services/notificationService.js';

  export const createTrack = async (req, res) => {
    if (req.user.role !== 'Creator') {
      return res.status(403).json({ error: 'Only creators can create tracks' });
    }
  
    try {
      const track = await Track.create({
        ...req.body,
        creatorId: req.user.id
      });
      res.status(201).json(track);
    } catch (error) {
      console.error('Error creating track:', error);
      res.status(500).json({ 
        error: 'Failed to create track',
        details: error.message
      });
    }
  };

  export const deleteTrack = async (req, res) => {
    try {
      const track = await Track.findByPk(req.params.trackId);
      
      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }
      
      if (track.creatorId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to delete this track' });
      }

      // Delete cover image from storage if exists
      if (track.coverImageUrl) {
        try {
          const filePath = track.coverImageUrl.split('/public/')[1];
          if (filePath) {
            await supabase.storage
              .from('track-assets')
              .remove([filePath]);
          }
        } catch (error) {
          console.error('Error deleting cover image:', error);
          // Continue with track deletion even if image deletion fails
        }
      }

      // Delete all modules and their associated content
      const modules = await Module.findAll({ where: { trackId: track.id } });
      
      for (const module of modules) {
        // Delete module video if exists
        if (module.videoUrl) {
          try {
            const filePath = module.videoUrl.split('/public/')[1];
            if (filePath) {
              await supabase.storage
                .from('module-videos')
                .remove([filePath]);
            }
          } catch (error) {
            console.error('Error deleting module video:', error);
          }
        }
        
        // Delete associated quiz
        if (module.quiz) {
          await module.quiz.destroy();
        }
      }

      // Delete the track (this will cascade delete modules, enrollments, discussions, etc.)
      await track.destroy();
      
      res.json({ message: 'Track deleted successfully' });
    } catch (error) {
      console.error('Error deleting track:', error);
      res.status(500).json({ error: 'Failed to delete track' });
    }
  };

  export const uploadTrackCover = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Check file type
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'Only image files are allowed' });
      }
  
      const optimizedImage = await sharp(req.file.buffer)
        .resize(800, 450)
        .webp({ quality: 80 })
        .toBuffer();
  
      const fileName = `tracks/${req.params.trackId}/cover-${Date.now()}.webp`;
      const { data, error } = await supabase.storage
        .from('track-assets')
        .upload(fileName, optimizedImage, {
          contentType: 'image/webp'
        });
  
      if (error) throw error;
  
      const coverImageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/track-assets/${fileName}`;
      await Track.update({ coverImageUrl }, { where: { id: req.params.trackId } });
      
      res.json({ coverImageUrl });
    } catch (error) {
      console.error('Error uploading cover:', error);
      res.status(500).json({ 
        error: 'Failed to upload cover image',
        details: error.message 
      });
    }
  };

  export const getTrackAnalytics = async (req, res) => {
    try {
      const track = await Track.findByPk(req.params.trackId);
      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }
      
      if (track.creatorId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }
  
      // Get enrollments with users using the correct association
      const enrollments = await Enrollment.findAll({
        where: { trackId: req.params.trackId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        }],
        attributes: ['id', 'progress', 'completed', 'createdAt', 'updatedAt', 'progressData', 'completedModules']
      });
  
      // Calculate completion rate
      const totalEnrollments = enrollments.length;
      const completedEnrollments = enrollments.filter(e => e.completed).length;
      const completionRate = totalEnrollments > 0 
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0;
  
      // Get modules for this track
      const modules = await Module.findAll({
        where: { trackId: req.params.trackId },
        include: [{
          model: Quiz,
          as: 'quiz'
        }],
        order: [['order', 'ASC']]
      });
  
      // Calculate module-specific analytics
      const moduleAnalytics = await Promise.all(modules.map(async (module) => {
        const moduleEnrollments = enrollments.filter(e => 
          e.progressData && e.progressData[module.id]
        );
        
        const completedModule = moduleEnrollments.filter(e => 
          e.progressData[module.id]?.completed
        ).length;
        
        const moduleCompletionRate = moduleEnrollments.length > 0 
          ? Math.round((completedModule / moduleEnrollments.length) * 100)
          : 0;
  
        // Quiz performance for this module
        let quizStats = null;
        if (module.quiz) {
          const quizAttempts = await QuizAttempt.findAll({
            where: { moduleId: module.id },
            attributes: ['score', 'passed', 'completedAt']
          });
  
          if (quizAttempts.length > 0) {
            const avgScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length;
            const passRate = quizAttempts.filter(attempt => attempt.passed).length / quizAttempts.length * 100;
            
            quizStats = {
              totalAttempts: quizAttempts.length,
              averageScore: Math.round(avgScore),
              passRate: Math.round(passRate),
              recentAttempts: quizAttempts.slice(0, 5).map(attempt => ({
                score: attempt.score,
                passed: attempt.passed,
                date: attempt.completedAt
              }))
            };
          }
        }
  
        return {
          moduleId: module.id,
          moduleTitle: module.title,
          moduleOrder: module.order,
          totalEnrollments: moduleEnrollments.length,
          completedEnrollments: completedModule,
          completionRate: moduleCompletionRate,
          quizStats
        };
      }));
  
      // Calculate drop-off points
      const dropOffAnalysis = calculateDropOffPoints(modules, enrollments);
  
      // Time-based analytics
      const timeAnalytics = calculateTimeAnalytics(enrollments);
  
      // Add this after fetching enrollments
      const enrollmentsOverTime = await sequelize.query(`
        SELECT 
          DATE("createdAt") as date, 
          COUNT(*) as count
        FROM "Enrollments"
        WHERE "trackId" = :trackId
          AND "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY date
        ORDER BY date ASC
      `, {
        replacements: { trackId: req.params.trackId },
        type: sequelize.QueryTypes.SELECT
      });
  
      res.json({
        enrollments,
        completionRate,
        totalEnrollments,
        moduleAnalytics,
        dropOffAnalysis,
        timeAnalytics,
        enrollmentsOverTime,
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ 
        error: 'Failed to get analytics',
        details: error.message
      });
    }
  };

  // Helper function to calculate drop-off points
  const calculateDropOffPoints = (modules, enrollments) => {
    const dropOffData = [];
    
    modules.forEach((module, index) => {
      const moduleEnrollments = enrollments.filter(e => 
        e.progressData && e.progressData[module.id]
      );
      
      const previousModule = index > 0 ? modules[index - 1] : null;
      const previousModuleEnrollments = previousModule 
        ? enrollments.filter(e => e.progressData && e.progressData[previousModule.id])
        : enrollments;
      
      const dropOffCount = previousModuleEnrollments.length - moduleEnrollments.length;
      const dropOffRate = previousModuleEnrollments.length > 0 
        ? Math.round((dropOffCount / previousModuleEnrollments.length) * 100)
        : 0;
      
      dropOffData.push({
        moduleId: module.id,
        moduleTitle: module.title,
        moduleOrder: module.order,
        dropOffCount,
        dropOffRate,
        remainingLearners: moduleEnrollments.length
      });
    });
    
    return dropOffData;
  };

  // Helper function to calculate time-based analytics
  const calculateTimeAnalytics = (enrollments) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentEnrollments = enrollments.filter(e => 
      new Date(e.createdAt) >= thirtyDaysAgo
    );
    
    const completedRecently = recentEnrollments.filter(e => 
      e.completed && new Date(e.updatedAt) >= thirtyDaysAgo
    );
    
    return {
      enrollmentsLast30Days: recentEnrollments.length,
      completionsLast30Days: completedRecently.length,
      averageTimeToComplete: calculateAverageCompletionTime(enrollments.filter(e => e.completed))
    };
  };

  // Helper function to calculate average completion time
  const calculateAverageCompletionTime = (completedEnrollments) => {
    if (completedEnrollments.length === 0) return 0;
    
    const totalTime = completedEnrollments.reduce((sum, enrollment) => {
      const startTime = new Date(enrollment.createdAt);
      const endTime = new Date(enrollment.updatedAt);
      return sum + (endTime - startTime);
    }, 0);
    
    return Math.round(totalTime / completedEnrollments.length / (1000 * 60 * 60 * 24)); // Days
  };

  export const searchTracks = async (req, res) => {
    try {
      const { 
        query = '', 
        category, 
        difficulty, 
        minRating = 0,
        sortBy = 'popular', 
        limit = 10, 
        offset = 0,
        creatorId
      } = req.query;

      const where = {
        isPublished: true
      };

      if (query && query.trim() !== "") {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { tags: { [Op.contains]: [query] } }
        ];
      }

      if (category && category !== "null") where.category = category;
      if (difficulty && difficulty !== "null") where.difficulty = difficulty;
      if (minRating) where.rating = { [Op.gte]: minRating };
      if (creatorId && creatorId !== "null") where.creatorId = creatorId;

      let order;
      switch (sortBy) {
        case 'newest':
          order = [['createdAt', 'DESC']];
          break;
        case 'highest-rated':
          order = [['rating', 'DESC']];
          break;
        case 'popular':
          order = [
            [sequelize.literal('(SELECT COUNT(*) FROM "Enrollments" WHERE "Enrollments"."trackId" = "Track"."id")'), 'DESC']
          ];
          break;
        default:
          order = [['createdAt', 'DESC']];
      }

      const tracks = await Track.findAndCountAll({
        where,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [{
          model: User,
          as: 'Creator',
          attributes: ['id', 'name', 'avatarUrl']
        }]
      });

      res.json({
        total: tracks.count,
        results: tracks.rows
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed', details: error.message });
    }
  };

  export const enrollInTrack = async (req, res) => {
    try {
      const { trackId } = req.params;
      const userId = req.user.id;
      console.log('Enrolling user:', userId, 'in track:', trackId);
      // Check if already enrolled
      const existing = await Enrollment.findOne({ where: { trackId, userId } });
      if (existing) {
        return res.status(400).json({ error: 'Already enrolled' });
      }
      const enrollment = await Enrollment.create({ trackId, userId });
      // Notify the creator of the track
      const track = await Track.findByPk(trackId, { include: [{ model: User, as: 'Creator' }] });
      if (track && track.Creator) {
        await notifyNewEnrollment(track.Creator.id, track.title, req.user.name);
      }
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to enroll in track' });
    }
  };

  export const updateTrack = async (req, res) => {
    try {
      console.log(req.body);
      
      const track = await Track.findByPk(req.params.trackId);
      if (!track) return res.status(404).json({ error: 'Track not found' });
      if (track.creatorId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

      await track.update(req.body);
      res.json(track);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update track' });
    }
  };

  export const getCreatorTracks = async (req, res) => {
    try {
      const tracks = await Track.findAll({
        where: { creatorId: req.user.id },
        include: [
          { model: User, as: 'Creator', attributes: ['id', 'name', 'avatarUrl'] },
          { model: Module, as: 'modules', attributes: ['id', 'title', 'duration', 'order'] }
        ]
      });

      // For each track, count enrollments and add enrollmentCount property
      const tracksWithCounts = await Promise.all(tracks.map(async (track) => {
        const enrollmentCount = await track.countEnrollments();
        return { ...track.toJSON(), enrollmentCount };
      }));

      res.json(tracksWithCounts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch creator tracks' });
    }
  };

  export const getTrackById = async (req, res) => {
    try {
      const track = await Track.findByPk(req.params.trackId, {
        include: [
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'name', 'avatarUrl']
          },
          {
            model: Module,
            as: 'modules',
            attributes: ['id', 'title', 'duration', 'order', 'videoUrl', 'videoStatus', 'videoDuration', 'notes']
          }
        ]
      });

      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }

      res.json(track);
    } catch (error) {
      console.error('Error fetching track:', error);
      res.status(500).json({ error: 'Failed to fetch track' });
    }
  };

  export const getEnrolledTracks = async (req, res) => {
    try {
      const enrollments = await Enrollment.findAll({
        where: { userId: req.user.id },
        include: [{
          model: Track,
          as: 'track',
          include: [{
            model: User,
            as: 'Creator',
            attributes: ['id', 'name', 'avatarUrl']
          }]
        }],
        order: [['updatedAt', 'DESC']]
      });

      const tracks = enrollments
        .filter(enrollment => enrollment.track !== null) // Filter out enrollments with null tracks
        .map(enrollment => ({
          ...enrollment.track.toJSON(),
          enrollment: {
            progress: enrollment.progress,
            completed: enrollment.completed,
            lastAccessed: enrollment.lastAccessed,
            completedModules: enrollment.completedModules
          }
        }));

      res.json(tracks);
    } catch (error) {
      console.error('Error fetching enrolled tracks:', error);
      res.status(500).json({ error: 'Failed to fetch enrolled tracks' });
    }
  };