# LearnX

LearnX is a full-stack learning and course-management platform designed to help learners discover tracks, progress through modules, and engage with creators and admins in a structured learning ecosystem. The project combines a modern React frontend with a Node.js/Express backend, PostgreSQL data storage, real-time notifications, and role-based access control.

This repository includes both the web application and the backend API in a monorepo structure, making it easy to run and extend locally or deploy across a frontend host and Node.js server.

## Why LearnX?

The platform is built for a learning community where:

- Learners can browse learning tracks and complete modules
- Creators can publish and manage educational content
- Admins can oversee the platform and manage operations
- Users can earn achievements, track progress, and interact in discussions
- AI-powered features can support course-related questions and experiences

## Core Features

### For Learners
- Browse available learning tracks
- View track details and module structure
- Enroll in content and track progress
- Access content pages and complete learning modules
- Participate in discussions and ask learning-related questions
- See achievements and gamified progress updates
- Receive notifications and stay engaged with the platform

### For Creators
- Create and manage learning tracks
- Add and organize modules within tracks
- Monitor learner engagement and content performance
- Manage course content from a creator dashboard
- Publish educational material and improve learning flow

### For Admins
- Access an admin dashboard
- Monitor platform activity and user/admin operations
- Manage platform-level workflows and moderation tools
- Oversee system access and content management

### Shared Features
- JWT-based authentication and protected routes
- Role-based routing for Learner, Creator, and Admin users
- Profile pages and public user visibility
- Real-time communication through Socket.IO
- AI routes for intelligent learning assistance
- Notification system for updates and actions
- Discussion system for community interaction

## Technology Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Tailwind CSS
- Chart.js and react-chartjs-2
- React Markdown
- Lucide React icons
- SweetAlert2 and React Toastify
- Socket.IO client

### Backend
- Node.js
- Express 5
- PostgreSQL with Sequelize ORM
- Socket.IO
- JWT authentication
- bcrypt / bcryptjs for password hashing
- dotenv for environment variables
- Multer for file uploads
- Nodemailer for email workflows
- Supabase JS client
- Sharp for image processing

### Deployment & Runtime
- Vercel-ready frontend configuration
- Docker Compose template for PostgreSQL support
- Express server with CORS and static file serving

## Project Structure

```text
New_LearnX/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── seeders/
│   ├── services/
│   ├── utils/
│   ├── .gitignore
│   ├── docker-compose.yml
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   ├── vercel.json
│   ├── vite.config.js
│   └── package-lock.json
│
├── readme.md
└── .gitignore (repo-level if present)
```

## Architecture Overview

The application follows a standard modern full-stack pattern:

- Frontend: React client and route-based dashboard experience
- API Layer: Express backend exposing REST endpoints
- Database: PostgreSQL managed through Sequelize models
- Real-time Layer: Socket.IO for live updates and notifications
- Authentication: JWT-based secure access with protected routes
- Storage: Supabase integration for external data/asset needs

The backend server is initialized in `backend/index.js` and exposes route groups like:

- `/api/auth`
- `/api/profile`
- `/api/tracks`
- `/api/modules`
- `/api/discussions`
- `/api/gamification`
- `/api/notifications`
- `/api/admin`
- `/api/ai`

## Main Domain Models

The backend includes models for:

- User
- Track
- Module
- Enrollment
- Quiz and QuizAttempt
- Discussion
- Notification
- Achievements and UserAchievement
- Admin invitation code
- AI Question records

This shows that the platform is not just a simple course portal—it includes engagement, progression, and admin tooling.

## Application Flow

### Learner Experience
1. Sign up or log in
2. Pick a learning track
3. View track modules and lessons
4. Complete learning material and quizzes
5. Earn progress, badges, and achievements
6. Interact in discussions and receive notifications

### Creator Experience
1. Log in as a creator
2. Manage tracks and modules
3. Publish or update course material
4. Monitor learner activity from creator dashboards

### Admin Experience
1. Log in as admin
2. Review system management panels
3. Oversee user or platform activities
4. Manage app-level administrative workflows

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+ recommended
- npm or yarn
- PostgreSQL database instance
- Git
- Optional: Supabase project credentials if you want to use all cloud-integrated features

## Local Setup

### 1) Clone the Repository

```bash
git clone https://github.com/YaSH-sInngH/New_LearnX.git
cd New_LearnX
```

### 2) Install Backend Dependencies

```bash
cd backend
npm install
```

### 3) Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4) Configure Environment Variables

Create a `.env` file in the `backend` directory and provide the required values. The application expects database connectivity through `DATABASE_URL`, and also uses JWT/security-related values for authentication.

Example:

```env
PORT=6166
DATABASE_URL=postgresql://username:password@localhost:5432/learnx_db
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

If you use the included Docker Compose template for PostgreSQL, update the connection settings to match your local database service.

### 5) Start the Backend

```bash
cd backend
npm start
```

The server starts on the port defined by `PORT` or defaults to `6166`.

### 6) Start the Frontend

```bash
cd frontend
npm run dev
```

The Vite app usually runs at:

- http://localhost:5173

### 7) Open the Application

Visit the frontend URL in your browser and continue with signup/login flow for the roles defined in the application.

## Database Notes

The backend uses Sequelize with PostgreSQL and calls `sequelize.sync({ alter: true })` during startup. This means the schema can be synchronized automatically, which is convenient for local development. For production, it is recommended to use controlled migrations instead of automatic alteration.

The project includes a Docker Compose template for PostgreSQL in `backend/docker-compose.yml`, which is commented out but serves as a baseline for local DB provisioning.

## Frontend Scripts

In `frontend/package.json`, the available scripts are:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Backend Scripts

In `backend/package.json`, the available scripts are:

```bash
npm start
```

There is also a `nodemon` dev dependency, so you can run the server in watch mode if desired.

## API Quick Reference

The backend is organized by route module and includes several domain-based APIs.

### Authentication
- `/api/auth`

### User/Profile
- `/api/profile`
- `/api` (protected routes)

### Learning Content
- `/api/tracks`
- `/api/modules`

### Community and Engagement
- `/api/discussions`
- `/api/notifications`
- `/api/gamification`

### Admin & AI
- `/api/admin`
- `/api/ai`

## Real-Time Features

Socket.IO is initialized in the backend and used for live events and notifications. This enables a more interactive platform experience for learners and creators, especially for updates and communication-based features.

## Production Considerations

Before deploying to a production environment, consider:

- Replacing local-only CORS origins with your production frontend domain
- Using secure environment variables and secrets
- Setting up a managed PostgreSQL instance instead of local DB mode
- Running the backend behind a process manager or cloud platform
- Securing admin routes and validation logic in production
- Setting up CI/CD and automated checks for both frontend and backend

## Recommended Development Workflow

1. Start PostgreSQL
2. Configure backend `.env`
3. Run backend server
4. Run frontend dev server
5. Use the app through login/signup and dashboard flows
6. Validate API endpoints and auth flows
7. Test role-based access for learner, creator, and admin

## Contributing

Contributions are welcome. A typical contribution flow is:

```bash
git checkout -b feature/my-improvement
git add .
git commit -m "Add my improvement"
git push origin feature/my-improvement
```

Then open a pull request in the repository.

## License

The backend package declares the ISC license. If you plan to reuse or distribute the project beyond personal use, verify the licensing terms before publishing any fork or deployment.

## Final Notes

LearnX is a polished learning platform project with a strong role-based architecture, community features, and a modern frontend. It is a strong foundation for a full educational product and can be extended with advanced features like payments, course analytics, subscriptions, content moderation, and deeper AI learning experiences.

If you want, I can also generate:

- a more polished GitHub-style README with badges and screenshots
- a backend `.env.example` file
- a frontend `.env.example` file
- a project-specific deployment guide for Vercel + Render/Railway
- a feature-by-feature technical architecture breakdown
