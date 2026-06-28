# Neon Hub

**A production-grade, full-stack media tracking platform.**

Track your movies, TV series, and video games in one beautiful, dark-themed dashboard. Rate, review, and organize your media library with custom lists and favorites.

## Tech Stack

### Frontend
- **React** (with Vite) — fast, modern UI
- **Bootstrap 5** — responsive layout and components
- **React Router DOM v6** — client-side routing
- **Axios** — HTTP client with interceptors for auth

### Backend
- **Node.js 20+ / Express.js** — REST API server
- **PostgreSQL** (via `pg`) — relational database hosted on Neon DB
- **JWT + bcrypt** — secure authentication with refresh tokens
- **helmet + cors + express-rate-limit** — security middleware
- **node-cache** — in-memory caching for trending content
- **Cloudinary** — avatar image storage

### External APIs
- **TMDB** — movie and TV series metadata
- **RAWG** — video game metadata

### Deployment
- **Frontend**: Netlify (free tier)
- **Backend**: Render (free tier)
- **Database**: Neon DB (free tier)
- **Storage**: Cloudinary (free tier)

## Getting Started

### Prerequisites
- Node.js 20+
- npm 9+

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd neon-hub
   ```

2. **Set up the backend:**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Fill in your .env values (see .env.example for required variables)
   npm run dev
   ```

3. **Set up the frontend:**
   ```bash
   cd client
   npm install
   cp .env.example .env
   # Set VITE_API_URL=http://localhost:5000
   npm run dev
   ```

4. **Open the app:**
   Navigate to `http://localhost:5173` in your browser.

## Project Structure

```
/neon-hub
├── client/          ← React frontend (Vite)
│   ├── src/
│   │   ├── components/   (common, media, dashboard, layout)
│   │   ├── context/      (Auth, Library, Search, Theme)
│   │   ├── hooks/        (useDebounce, useAuth, useLibrary, etc.)
│   │   ├── pages/        (auth, movies, series, games, dashboard, profile)
│   │   ├── routes/       (AppRouter with ProtectedRoute)
│   │   ├── services/     (api.js, authService, mediaService, libraryService)
│   │   ├── styles/       (main.css design system)
│   │   └── utils/        (formatDate, truncateText, etc.)
│   └── netlify.toml
│
├── server/          ← Express backend
│   ├── config/       (db.js, cache.js)
│   ├── controllers/  (auth, movies, series, games, library, reviews, lists, dashboard)
│   ├── middleware/    (authMiddleware, errorHandler, rateLimiter, cloudinary)
│   ├── models/       (user, library, review, list, activity)
│   ├── routes/       (auth, movies, series, games, library, reviews, lists, dashboard)
│   ├── services/     (tmdbService, rawgService, emailService)
│   ├── validators/   (auth, library, review)
│   ├── database/     (schema.sql, seed.sql)
│   └── server.js
│
└── reports/         ← Phase completion reports
```

## Environment Variables

See `server/.env.example` and `client/.env.example` for all required variables.

> **Important:** Never commit `.env` files. Only `.env.example` files with empty values should be in version control.

## License

ISC
