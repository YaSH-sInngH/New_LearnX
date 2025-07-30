import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { sequelize, setupRelationships } from './models/index.js';
import authRoutes from './routes/authRoutes.js';
import protectedRoutes from './routes/protectedRoute.js';
import profileRoutes from './routes/profileRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import discussionRoutes from './routes/discussionRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import gamificationRoutes from './routes/gamificationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { initializeSocket } from './services/socketService.js';
import multer from 'multer';

dotenv.config();

const app = express();
const server = createServer(app);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Socket.IO
initializeSocket(server);

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            "https://learn-x-jet.vercel.app",
            "http://localhost:5173",
            "http://localhost:45705"
        ];
        
        // Allow any localhost port for development
        if (origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
    res.send('LearnX API is running');
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

const PORT = process.env.PORT || 6166;

const startServer = async () => {
    try {
        console.log('Connecting to DB at:', process.env.DATABASE_URL);
        await sequelize.authenticate();
        console.log('Database connected successfully!');
        
        setupRelationships(); // Initialize all model relationships
        
        await sequelize.sync({ alter: true });
        console.log('Database tables synchronized!');
        
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Socket.IO initialized`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

startServer();