# DailyQuran - Quran Reading Tracker Application

> A full-stack application for tracking daily Quran reading habits with audio recording capabilities and streak management system.

## Overview

DailyQuran is a full-stack web application that helps users build consistent habits of reading the Quran. This application combines a tracking system, audio recording, and streak gamification to increase user motivation in worship.

Inspired by Duolingo, this app adopts the concept of gamification and daily consistency to build positive habits in reading the Quran.

### Core Features

- **Authentication**: Complete user system with role-based access control
- **Audio Recording System**: Voice recording for Quran recitation with cloud storage
- **Consistency/Streak Tracking**: Daily streak system to motivate consistency
- **Dashboard & Analysis**: Personal dashboard with progress visualization

## Tech Stack

### Backend
- **Framework**: [Hono.js](https://hono.dev/) - Modern web framework for TypeScript
- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Storage**: [Supabase Storage](https://supabase.com/docs/guides/storage) for audio files
- **Authentication**: JWT with refresh token rotation
- **Password Hashing**: Argon2 for secure password storage
- **Logging**: Winston for structured logging
- **Validation**: Zod for schema validation

### Frontend
- **Framework**: React 19 with TypeScript
- **Routing**: [TanStack Router](https://tanstack.com/router) for type-safe routing
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for client state
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) for server state
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Forms**: React Hook Form with Zod validation

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL
- **File Storage**: Supabase cloud storage
- **Logging**: Structured logging with Winston

## Project Structure

```
├── src/                          # Backend source code
│   ├── main.ts                   # Application entry point
│   ├── routes.ts                 # API route definitions
│   ├── modules/                  # Feature modules
│   │   ├── authentication/       # Auth system
│   │   ├── user/                 # User management
│   │   ├── recordings/           # Recording system
│   │   ├── streaks/              # Streak tracking
│   │   └── surahs/               # Surahs module (Endpoint Proxy)
│   ├── config/                   # Configuration
│   │   ├── db/                   # Database setup & schema
│   │   ├── logging.ts            # Logging configuration
│   │   └── supabase.ts           # Supabase client
│   ├── lib/                      # Shared utilities
│   │   ├── middleware/           # Custom middleware
│   │   ├── repository.ts         # Base repository pattern
│   │   ├── response.ts           # Standardized API responses
│   │   └── types.ts              # TypeScript definitions
│   └── __tests__/                # Test files & load testing
├── web/                          # Frontend React application
│   ├── src/
│   │   ├── routes/               # Page components
│   │   ├── components/           # Reusable UI components
│   │   ├── lib/                  # Frontend utilities
│   │   ├── hooks/                # Custom React hooks
│   │   └── types/                # TypeScript definitions
│   └── public/                   # Static assets
├── drizzle/                      # Database migrations
├── docker-compose.yml            # Development environment
├── docker-compose.prod.yml       # Production environment
└── deploy.sh                     # Deployment script
```

## Quick Start

### Prerequisites

- **Node.js** (v24 or higher)
- **PostgreSQL** (v15 or higher)
- **Docker & Docker Compose** (optional, for containerized setup)

### 1. Clone Repository

```bash
git clone https://github.com/hildanku/quran-foundation.git
cd quran-foundation
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env_example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**

```env
# Server Configuration
PORT=5555

# Database
DATABASE_URL="postgres://username:password@localhost:5432/dbname"

# Supabase (for file storage)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_STORAGE_BUCKET=dailyquran

# JWT Configuration
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=3
REFRESH_TOKEN_EXPIRES_IN=30

# Quran Foundation API (optional)
QF_OAUTH_BASE_URL=https://oauth2.quran.foundation # you can use pre-production before prod
QF_API_BASE_URL=https://apis.quran.foundation # you can use pre-production before prod
QF_CLIENT_ID=your_client_id
QF_CLIENT_SECRET=your_client_secret
```

### 3. Database Setup

```bash
# Install dependencies
npm install

# Run database migrations
npx drizzle-kit migrate
```

### 4. Development Mode

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd web
npm install
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5555

### 5. Docker Setup (Alternative)

```bash
# Development environment
docker-compose up -d

# Production environment
docker-compose -f docker-compose.prod.yml up -d
```

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST   | `/api/v1/auth/register` | Register new user | ❌ |
| POST   | `/api/v1/auth/login` | User login | ❌ |
| POST   | `/api/v1/auth/refresh` | Refresh JWT token | ❌ |
| GET    | `/api/v1/auth/current_user` | Get current user | ✅ |
| DELETE | `/api/v1/auth/logout` | User logout | ✅ |

### User Management (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/users` | List all users |
| GET    | `/api/v1/users/:id` | Get user by ID |
| POST   | `/api/v1/users` | Create new user |
| PUT    | `/api/v1/users/:id` | Update user |
| DELETE | `/api/v1/users/:id` | Delete user |

### Recordings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/recordings` | List recordings (admin) |
| GET    | `/api/v1/recordings/user` | User's recordings |
| POST   | `/api/v1/recordings` | Create recording |
| POST   | `/api/v1/recordings/upload` | Upload audio file |
| PUT    | `/api/v1/recordings/:id` | Update recording |
| DELETE | `/api/v1/recordings/:id` | Delete recording |

### Streaks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/streaks/user` | Get user's streak |
| POST   | `/api/v1/streaks` | Create/update streak |

## Database Schema

### Users Table
```sql
users (
  id: int PRIMARY KEY,
  username: varchar(100) UNIQUE,
  email: varchar(100) UNIQUE,
  name: text,
  role: enum('admin', 'member'),
  avatar: text NULL,
  created_at: timestamp,
  updated_at: timestamp
)
```

### Authentications Table
```sql
authentications (
  id: int PRIMARY KEY,
  user_id: int REFERENCES users(id) ON DELETE CASCADE,
  hash_password: text,
  refresh_token: text NULL,
  created_at: timestamp,
  updated_at: timestamp
)
```

### Recordings Table
```sql
recordings (
  id: int PRIMARY KEY,
  user_id: int REFERENCES users(id) ON DELETE CASCADE,
  file_url: text,
  note: text NULL,
  created_at: timestamp,
  updated_at: timestamp
)
```

### Streaks Table
```sql
streaks (
  id: int PRIMARY KEY,
  user_id: int REFERENCES users(id) ON DELETE CASCADE,
  current_streak: int DEFAULT 0,
  longest_streak: int DEFAULT 0,
  last_recorded_at: timestamp NULL
)
```

## Key Features Implementation

### 1. Authentication System
- **JWT-based authentication** with access & refresh tokens
- **Role-based authorization** (admin(but for now not implemented)/member)
- **Secure password hashing** using Argon2
- **Automatic token refresh** mechanism

### 2. Audio Recording System
- **Browser-based audio recording** using MediaRecorder API
- **Cloud storage integration** with Supabase
- **Audio playback capabilities**

### 3. Streak Management
- **Daily streak tracking** with automatic calculation
- **Longest streak records** for gamification
- **Progress visualization** with calendar view
- **Streak reset logic** for missed days

### 4. Modern Frontend Architecture
- **Type-safe routing** with TanStack Router
- **Optimistic updates** with TanStack Query
- **Responsive design** with Tailwind CSS
- **Component-based architecture** with shadcn/ui

## Deployment

### Production Deployment with Docker

1. **Deploy:**
```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Code Standards
- **TypeScript strict mode** enabled
- **ESLint configuration** for code quality
- **Prettier formatting** for consistency
- **Conventional commits** for clear history

## Acknowledgments

- [Hono.js](https://hono.dev/) for the excellent web framework
- [TanStack](https://tanstack.com/) for router and query libraries
- [Supabase](https://supabase.com/) for backend services
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Quran Foundation](https://quran.foundation/) for API integration

## Special Thanks to
- GetterSethya
- SyahrulBudiF
- Stackoverflow

---

**Made with ❤️**

For questions or support, please open an issue or contact the development team.