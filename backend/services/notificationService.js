import { Notification, User, Enrollment, Track } from '../models/index.js';
import { sendNotificationToUser, sendNotificationToAdmins, sendNotificationToTrackUsers } from './socketService.js';

export const createNotification = async (userId, {
  type,
  title,
  message,
  metadata = {}
}) => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    metadata,
    isRead: false
  });
  
  console.log(`[NotificationService] Sending real-time notification to userId=${userId}:`, notification.toJSON());

  // Send real-time notification
  try {
    sendNotificationToUser(userId, notification);
  } catch (error) {
    console.error('Failed to send real-time notification:', error);
  }

  return notification;
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, userId }
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return await notification.update({ isRead: true });
};

export const getUserNotifications = async (userId, limit = 20) => {
  return await Notification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit
  });
};

export const getUnreadCount = async (userId) => {
  return await Notification.count({
    where: { userId, isRead: false }
  });
};

// Notification triggers for different events
export const notifyNewModule = async (trackId, moduleTitle) => {
  try {
    // Get all enrolled users for this track
    const enrollments = await Enrollment.findAll({
      where: { trackId },
      include: [{ model: User, as: 'user' }]
    });

    const notificationPromises = enrollments.map(enrollment => 
      createNotification(enrollment.userId, {
        type: 'track_update',
        title: 'New Module Available',
        message: `A new module "${moduleTitle}" has been added to a track you're enrolled in.`,
        metadata: { trackId, moduleTitle }
      })
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Failed to notify new module:', error);
  }
};

export const notifyQuizResult = async (userId, moduleTitle, passed, score, xpGained = 0) => {
  try {
    await createNotification(userId, {
      type: 'achievement',
      title: passed ? 'Quiz Passed!' : 'Quiz Result',
      message: passed 
        ? `Congratulations! You passed the quiz for "${moduleTitle}" with ${score}% score.${xpGained ? ` +${xpGained} XP earned!` : ''}`
        : `You scored ${score}% on the quiz for "${moduleTitle}". Keep practicing!`,
      metadata: { moduleTitle, passed, score, xpGained }
    });
  } catch (error) {
    console.error('Failed to notify quiz result:', error);
  }
};

export const notifyDiscussionReply = async (userId, trackTitle, replyAuthor) => {
  try {
    await createNotification(userId, {
      type: 'new_comment',
      title: 'New Reply',
      message: `${replyAuthor} replied to your discussion in "${trackTitle}".`,
      metadata: { trackTitle, replyAuthor }
    });
  } catch (error) {
    console.error('Failed to notify discussion reply:', error);
  }
};

export const notifyTrackApproval = async (creatorId, trackTitle, approved) => {
  try {
    await createNotification(creatorId, {
      type: 'system',
      title: approved ? 'Track Approved' : 'Track Update',
      message: approved 
        ? `Your track "${trackTitle}" has been approved and is now live!`
        : `Your track "${trackTitle}" needs some updates before approval.`,
      metadata: { trackTitle, approved }
    });
  } catch (error) {
    console.error('Failed to notify track approval:', error);
  }
};

export const notifyNewReview = async (creatorId, trackTitle, reviewerName, rating) => {
  try {
    await createNotification(creatorId, {
      type: 'new_comment',
      title: 'New Review',
      message: `${reviewerName} left a ${rating}-star review on "${trackTitle}".`,
      metadata: { trackTitle, reviewerName, rating }
    });
  } catch (error) {
    console.error('Failed to notify new review:', error);
  }
};

export const notifyNewEnrollment = async (creatorId, trackTitle, learnerName) => {
  try {
    await createNotification(creatorId, {
      type: 'message',
      title: 'New Enrollment',
      message: `Someone enrolled in your track "${trackTitle}".`,
      metadata: { trackTitle, learnerName }
    });
  } catch (error) {
    console.error('Failed to notify new enrollment:', error);
  }
};

export const notifyTrackSubmission = async (trackTitle, creatorName) => {
  try {
    // Send to all admins
    const admins = await User.findAll({ where: { role: 'Admin' } });
    
    const notificationPromises = admins.map(admin =>
      createNotification(admin.id, {
        type: 'system',
        title: 'New Track Submission',
        message: `${creatorName} submitted "${trackTitle}" for approval.`,
        metadata: { trackTitle, creatorName }
      })
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Failed to notify track submission:', error);
  }
};