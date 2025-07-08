import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join admin room if user is admin
    if (socket.userRole === 'Admin') {
      socket.join('admin_room');
    }

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Send notification to specific user
export const sendNotificationToUser = (userId, notification) => {
  const socketIO = getIO();
  const plainNotification = notification.get({ plain: true });
  console.log(`[SocketService] Emitting to room: user_${userId}`, plainNotification);
  socketIO.to(`user_${userId}`).emit('new_notification', plainNotification);
};

// Send notification to all admins
export const sendNotificationToAdmins = (notification) => {
  const socketIO = getIO();
  socketIO.to('admin_room').emit('new_notification', notification);
};

// Send notification to all users in a track
export const sendNotificationToTrackUsers = (trackId, notification) => {
  const socketIO = getIO();
  socketIO.to(`track_${trackId}`).emit('new_notification', notification);
};

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

  try {
    sendNotificationToUser(userId, notification);
    // Add log after sending
    console.log(`[NotificationService] Real-time notification sent to userId=${userId}`);
  } catch (error) {
    console.error('Failed to send real-time notification:', error);
  }

  return notification;
}; 