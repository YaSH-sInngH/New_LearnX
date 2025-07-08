import { sequelize } from '../config/database.js';
import User from './user.js';
import Track from './track.js';
import Module from './module.js';
import Quiz from './quiz.js';
import Review from './review.js';
import Enrollment from './enrollment.js';
import Discussion from './discussion.js';
import QuizAttempt from './quizAttempt.js';
import UserAchievement from './userAchievement.js';
import Achievement from './achievements.js';
import Notification from './Notification.js';
import AIQuestion from './aiQuestion.js';
import AdminInvitationCode from './adminInvitationCode.js';

// Define all relationships
function setupRelationships() {
  // Track <-> User (Creator)
  User.hasMany(Track, { foreignKey: 'creatorId', as: 'createdTracks' });
  Track.belongsTo(User, { foreignKey: 'creatorId', as: 'Creator' });

  // Track <-> Module (One-to-Many)
  Track.hasMany(Module, { foreignKey: 'trackId', as: 'modules', onDelete: 'CASCADE' });
  Module.belongsTo(Track, { foreignKey: 'trackId', as: 'Track' });

  // Module <-> Quiz (One-to-One)
  Module.hasOne(Quiz, { foreignKey: 'moduleId', as: 'quiz', onDelete: 'CASCADE' });
  Quiz.belongsTo(Module, { foreignKey: 'moduleId', as: 'module' });

  // Enrollment associations (Enrollment is a standalone model)
  Enrollment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Enrollment.belongsTo(Track, { foreignKey: 'trackId', as: 'track' });
  User.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'userId' });
  Track.hasMany(Enrollment, { foreignKey: 'trackId', as: 'enrollments' });

  // Track <-> Discussion (One-to-Many)
  Track.hasMany(Discussion, { foreignKey: 'trackId', as: 'discussions', onDelete: 'CASCADE' });
  Discussion.belongsTo(Track, { foreignKey: 'trackId', as: 'track' });

  // User <-> Discussion (One-to-Many)
  User.hasMany(Discussion, { foreignKey: 'userId', as: 'discussionPosts' });
  Discussion.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Discussion Replies (Self-Reference)
  Discussion.hasMany(Discussion, { foreignKey: 'parentId', as: 'replies', onDelete: 'CASCADE' });
  Discussion.belongsTo(Discussion, { foreignKey: 'parentId', as: 'parentDiscussion' });

  // Review <-> User & Track
  Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Review.belongsTo(Track, { foreignKey: 'trackId', as: 'track' });
  User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
  Track.hasMany(Review, { foreignKey: 'trackId', as: 'reviews' });

  // QuizAttempt <-> User, Quiz, Module
  QuizAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  QuizAttempt.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });
  QuizAttempt.belongsTo(Module, { foreignKey: 'moduleId', as: 'module' });
  User.hasMany(QuizAttempt, { as: 'quizAttempts', foreignKey: 'userId' });
  Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId', as: 'quizAttempts' });
  Module.hasMany(QuizAttempt, { foreignKey: 'moduleId', as: 'quizAttempts' });

  // User <-> Achievement (Many-to-Many through UserAchievement)
  User.belongsToMany(Achievement, { through: UserAchievement, as: 'achievements', foreignKey: 'UserId' });
  Achievement.belongsToMany(User, { through: UserAchievement, as: 'users', foreignKey: 'AchievementId' });

  // User <-> Notification (One-to-Many)
  Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

  // AIQuestion associations
  AIQuestion.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  AIQuestion.belongsTo(Module, { foreignKey: 'moduleId', as: 'module' });
  AIQuestion.belongsTo(Track, { foreignKey: 'trackId', as: 'track' });
  User.hasMany(AIQuestion, { foreignKey: 'userId', as: 'aiQuestions' });
  Module.hasMany(AIQuestion, { foreignKey: 'moduleId', as: 'aiQuestions' });
  Track.hasMany(AIQuestion, { foreignKey: 'trackId', as: 'aiQuestions' });

  // AdminInvitationCode associations
  AdminInvitationCode.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  AdminInvitationCode.belongsTo(User, { foreignKey: 'usedBy', as: 'usedByUser' });
  User.hasMany(AdminInvitationCode, { foreignKey: 'createdBy', as: 'createdInvitationCodes' });
  User.hasMany(AdminInvitationCode, { foreignKey: 'usedBy', as: 'usedInvitationCodes' });
}

// Initialize all models
const models = {
  User,
  Track,
  Module,
  Quiz,
  Enrollment,
  Discussion,
  QuizAttempt,
  UserAchievement,
  Achievement,
  AIQuestion
};

// Export initialized models and sequelize instance
export { 
  sequelize,
  models,
  setupRelationships,
  User,
  Track,
  Module,
  Quiz,
  Enrollment,
  Discussion,
  Review,
  QuizAttempt,
  UserAchievement,
  Achievement,
  Notification,
  AIQuestion,
  AdminInvitationCode
};