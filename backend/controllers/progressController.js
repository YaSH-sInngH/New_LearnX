import { Enrollment, Module, Track, User } from '../models/index.js';

export const saveModuleProgress = async (req, res) => {
  try {
    const { moduleId, position, completed } = req.body;
    
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

    let enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.id,
        trackId: module.Track.id
      }
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        userId: req.user.id,
        trackId: module.Track.id,
        progressData: {}
      });
    }

    // Update progress data
    const progressData = enrollment.progressData || {};
    progressData[moduleId] = {
      lastPosition: position,
      completed: completed || (progressData[moduleId]?.completed || false),
      updatedAt: new Date()
    };

    // Update completed modules if needed
    let completedModules = [...enrollment.completedModules];
    if (completed && !completedModules.includes(moduleId)) {
      completedModules.push(moduleId);
    }

    // Calculate overall progress
    const totalModules = await Module.count({ where: { trackId: module.Track.id } });
    let progress = Math.round((completedModules.length / totalModules) * 100);
    let isTrackCompleted = completedModules.length === totalModules;

    // Defensive: If progress is 100, ensure all modules are in completedModules and completed is true
    if (progress === 100 && totalModules > 0) {
      const allModules = await Module.findAll({ where: { trackId: module.Track.id }, attributes: ['id'] });
      const allModuleIds = allModules.map(m => m.id);
      // Add any missing module IDs
      completedModules = Array.from(new Set([...completedModules, ...allModuleIds]));
      isTrackCompleted = true;
      progress = 100;
      // Defensive: Ensure progressData has an entry for every module
      for (const mod of allModules) {
        if (!progressData[mod.id]) {
          progressData[mod.id] = {
            completed: true,
            lastPosition: null,
            updatedAt: new Date()
          };
        } else {
          // If already exists, ensure completed is true
          progressData[mod.id].completed = true;
        }
      }
    }

    enrollment.progressData = progressData;
    enrollment.completedModules = completedModules;
    enrollment.progress = progress;
    enrollment.lastModuleId = moduleId;
    enrollment.lastAccessed = new Date();
    enrollment.completed = isTrackCompleted;
    enrollment.changed('progressData', true);
    await enrollment.save();

    const userId = req.user.id;
    const user = await User.findByPk(userId);

    let xpGained = 0;
    let newBadge = null;
    if (progress.completed) {
      xpGained = 50; // Example: 50 XP for module completion
      user.xp = (user.xp || 0) + xpGained;
      await user.save();
      // Check for new achievements
      const { newAchievements } = await checkAchievements(userId);
      if (newAchievements.length > 0) {
        newBadge = newAchievements[0]; // Return the first new badge for modal
      }
    }

    console.log('saveModuleProgress called with:', req.body);
    console.log('User:', req.user.id, 'Track:', module.Track.id, 'Module:', moduleId);
    console.log('Before update, progressData:', enrollment.progressData);

    res.json({
      success: true,
      xpGained,
      newBadge,
      xp: user.xp,
      badges: user.badges,
      progress,
      completedModules,
      moduleProgress: progressData[moduleId]
    });
  } catch (error) {
    console.error('saveModuleProgress error:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
};

export const getTrackProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.id,
        trackId: req.params.trackId
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Not enrolled in this track' });
    }

    res.json({
      progress: enrollment.progress,
      completedModules: enrollment.completedModules,
      lastModuleId: enrollment.lastModuleId,
      lastPosition: enrollment.progressData[enrollment.lastModuleId]?.lastPosition || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get progress' });
  }
};