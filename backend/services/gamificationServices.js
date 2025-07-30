import { User, Achievement, Enrollment, QuizAttempt } from '../models/index.js';

export const updateUserStreak = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const user = await User.findByPk(userId);

  if (!user.lastActiveDate) {
    // First activity
    await user.update({
      streakDays: 1,
      lastActiveDate: today
    });
    return 1;
  }

  const lastActive = new Date(user.lastActiveDate);
  const currentDate = new Date(today);
  const dayDiff = Math.floor((currentDate - lastActive) / (1000 * 60 * 60 * 24));

  let newStreak = user.streakDays;
  if (dayDiff === 1) {
    // Consecutive day
    newStreak += 1;
  } else if (dayDiff > 1) {
    // Broken streak
    newStreak = 1;
  }

  await user.update({
    streakDays: newStreak,
    lastActiveDate: today
  });

  return newStreak;
};

export const awardXP = async (userId, amount, reason) => {
  const user = await User.findByPk(userId);
  const newXP = user.xp + amount;

  await user.update({ xp: newXP });
  
  // Check for level-up
  const newLevel = calculateLevel(newXP);
  if (newLevel > calculateLevel(user.xp)) {
    // Level up logic
  }

  // Check achievements
  await checkAchievements(userId);

  return newXP;
};

const calculateLevel = (xp) => {
  return Math.floor(xp / 1000) + 1; // 1000 XP per level
};

export const checkAchievements = async (userId) => {
  const achievements = await Achievement.findAll();
  const user = await User.findByPk(userId, {
    include: [
      { model: Enrollment, as: 'enrollments' },
      { model: QuizAttempt, as: 'quizAttempts' },
      { model: Achievement, as: 'achievements' }
    ]
  });
  const newAchievements = [];
  for (const achievement of achievements) {
    const hasAchievement = user.achievements?.some(a => a.id === achievement.id);
    if (hasAchievement) continue;
    if (checkAchievementCriteria(achievement.criteria, user)) {
      await user.addAchievement(achievement);
      await awardXP(userId, achievement.xpReward, `Achievement: ${achievement.name}`);
      // Add badge image to cache if applicable
      if (achievement.badgeImage && (!user.badges || !user.badges.includes(achievement.badgeImage))) {
        user.badges = [...(user.badges || []), achievement.badgeImage];
        await user.save();
      }
      newAchievements.push(achievement);
    }
  }
  return { newAchievements };
};

const checkAchievementCriteria = (criteria, user) => {
  if (!criteria || !user) return false;
  // XP-based achievement
  if (criteria.type === 'xp' && typeof criteria.amount === 'number') {
    return user.xp >= criteria.amount;
  }
  // Completed tracks achievement
  if (criteria.type === 'completed_tracks' && typeof criteria.count === 'number') {
    const completedTracks = user.enrollments?.filter(e => e.completed).length || 0;
    return completedTracks >= criteria.count;
  }
  // Quiz attempts achievement
  if (criteria.type === 'quiz_attempts' && typeof criteria.count === 'number') {
    const attempts = user.quizAttempts?.length || 0;
    return attempts >= criteria.count;
  }
  // Add more criteria types as needed
  return false;
};