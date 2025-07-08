import { User, Achievement, Enrollment } from '../models/index.js';
import { awardXP } from '../services/gamificationServices.js';

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.findAll({
      attributes: ['id', 'name', 'avatarUrl', 'xp', 'streakDays'],
      order: [['xp', 'DESC']],
      limit: 100
    });

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

export const getUserProgress = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'xp', 'streakDays', 'badges'],
      include: [{
        model: Achievement,
        as: 'achievements',
        through: { attributes: ['earnedAt'] },
        attributes: ['id', 'name', 'description', 'badgeImage', 'xpReward']
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const level = calculateLevel(user.xp);
    const levelProgress = user.xp % 1000;

    res.json({
      ...user.toJSON(),
      achievements: user.achievements || [],
      level,
      levelProgress,
      nextLevelXP: level * 1000
    });
  } catch (error) {
    console.error('getUserProgress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
};

const calculateLevel = (xp) => {
  return Math.floor(xp / 1000) + 1;
};

export const getTrackLeaderboard = async (req, res) => {
  try {
    const { trackId } = req.params;
    const enrollments = await Enrollment.findAll({
      where: { trackId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatarUrl', 'xp']
      }],
      order: [['progress', 'DESC']],
      limit: 20
    });
    res.json(enrollments.map(e => ({
      user: e.user,
      progress: e.progress,
      xp: e.user?.xp || 0
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get track leaderboard' });
  }
};