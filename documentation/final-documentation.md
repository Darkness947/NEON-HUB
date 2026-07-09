<div align="center">
  <img src="../client/src/assets/images/main_logo.png" alt="Neon Hub Logo" width="200" />

  <h1>Neon Hub Final Technical Documentation</h1>
  <p><strong>A comprehensive deep dive into the architecture, technical decisions, integrations, and implementation details of the Neon Hub platform.</strong></p>
  <hr />
</div>

## 📑 Table of Contents
1. [System Architecture](#1-system-architecture)
2. [Frontend Architecture (React)](#2-frontend-architecture-react)
3. [Backend Architecture (Express)](#3-backend-architecture-express)
4. [Database Design & Normalization](#4-database-design--normalization)
5. [Authentication & Security](#5-authentication--security)
6. [External API Integrations](#6-external-api-integrations)
7. [AI Subsystem (Gemini)](#7-ai-subsystem-gemini)
8. [Performance & Optimization](#8-performance--optimization)
9. [Design System & UI](#9-design-system--ui)

---

## 🏗️ 1. System Architecture

Neon Hub employs a modern, decoupled client-server architecture designed for high responsiveness, security, and scalability.

- **Frontend:** A Single Page Application (SPA) built using React 18 and Vite. It serves as the visual layer, handling client-side routing, state management, and real-time UI updates without full page reloads.
- **Backend:** A monolithic REST API built with Node.js and Express.js. It acts as the orchestrator, enforcing business logic, securing routes, interacting with the database, and proxying requests to third-party services to keep API keys hidden.
- **Database:** A PostgreSQL relational database hosted on Neon DB, taking advantage of serverless scaling and connection pooling.

**Data Flow:**
User interactions in the browser trigger asynchronous Axios requests. The Express backend validates the payload, verifies JWT tokens, queries the PostgreSQL database via parameterized SQL, and returns structured JSON responses to update the React context state.

---

## 🌐 2. Frontend Architecture (React)

### Routing & Structure
The frontend utilizes `react-router-dom` (v6) for navigation.
- **Protected Routes:** A custom `<ProtectedRoute>` component acts as a guard. If a user is not authenticated (checked via the `AuthContext`), they are automatically redirected to the `/login` page.
- **Dynamic Routing:** Media detail pages utilize URL parameters (e.g., `/movies/:id`, `/series/:id`) to fetch specific item metadata on mount.

### State Management
State is localized where possible, and elevated to React Context only when globally required.
- **AuthContext:** Manages the active user object, session loading states, and exposes `login()` and `logout()` functions.
- **LibraryContext:** Manages the user's tracked media items. It fetches the library on startup and provides helper functions (`isInLibrary`, `addToLibrary`, `updateItem`) to keep the UI perfectly synchronized without requiring manual refreshes.

### Axios Interceptors & Networking
All network requests funnel through a centralized Axios instance (`client/src/services/api.js`). 
This instance attaches the in-memory Access Token to every outgoing request. More importantly, it features an interceptor that listens for `401 Unauthorized` responses. If a token expires mid-session, the interceptor pauses the outgoing requests, hits the refresh endpoint, receives the new token, and replays the paused requests completely transparently to the user.

---

## ⚙️ 3. Backend Architecture (Express)

### The Controller-Service-Model Pattern
The backend adheres to a strict separation of concerns to maintain readability and testability.
- **Controllers:** Handle HTTP requests and responses. They extract data from `req.body` or `req.params`, call the appropriate services or models, and send the final JSON response. Every controller is wrapped in a custom `asyncHandler` to eliminate `try/catch` boilerplate.
- **Services:** Manage business logic and third-party integrations (e.g., `tmdbService.js`, `rawgService.js`, `cloudinaryService.js`). They format outbound requests and sanitize incoming third-party data.
- **Models / Database Queries:** Dedicated files that house the raw SQL queries executed by the `pg` pool.

### Error Handling
A global error handling middleware (`errorHandler.js`) captures all thrown errors. We utilize a custom `AppError` class that allows controllers to specify the HTTP status code, an operational error code, and a human-readable message. Uncaught exceptions fall back to a generic 500 error, never leaking stack traces in production.

---

## 🗄️ 4. Database Design & Normalization

The PostgreSQL database is heavily normalized to ensure data integrity.

### Tables
1. **`users`**: Core user identities.
2. **`refresh_tokens`**: Stores hashed refresh tokens to manage persistent sessions.
3. **`tracked_movies`, `tracked_series`, `tracked_games`**: Separated tables for tracking distinct media types. This prevents null-heavy schemas (since games don't have seasons, and movies don't have hours played).
4. **`movie_reviews`, `series_reviews`, `game_reviews`**: Separated review tables linked to both the user and the media ID.
5. **`ai_cache`**: Caches highly expensive AI responses.
6. **`activity_log`**: A chronological ledger of user actions.
7. **`custom_lists`**: JSONB-powered lists allowing users to group arbitrary media IDs.

### Constraints & Optimization
- **Foreign Keys:** Enforce referential integrity (e.g., deleting a user cascades to their library and reviews).
- **Unique Constraints:** Combinations like `UNIQUE(user_id, tmdb_id)` ensure a user cannot add the same movie to their library twice.
- **Indexing:** B-tree indexes are applied to foreign keys and search columns to guarantee fast lookup times even as tables grow large.

---

## 🔐 5. Authentication & Security

### The Two-Token JWT Flow
To maximize security while maintaining UX, Neon Hub avoids storing sensitive tokens in `localStorage`.
1. **Access Token:** A JWT signed with HS256, containing only the `user_id`. It expires in 15 minutes. It is kept strictly in React's JavaScript memory (`window.__accessToken`), making it immune to XSS attacks.
2. **Refresh Token:** A cryptographically secure random string. It is hashed via bcrypt before being stored in the database. The raw string is sent to the client as an `HttpOnly`, `Secure`, `SameSite=Strict` cookie, preventing client-side scripts from reading it.

### Route Protection
The `authMiddleware` intercepts requests to protected API endpoints, verifying the Bearer token. If invalid, it throws a `401`.

### Data Sanitization
All inputs are validated. Passwords are hashed with bcrypt (12 salt rounds), ensuring that even in the event of a database breach, passwords cannot be trivially cracked.

---

## 🔌 6. External API Integrations

### TMDB (The Movie Database)
- Proxied through the Express backend to hide the `TMDB_API_KEY`.
- Used for fetching trending movies, searching TV shows, and resolving deep metadata (cast, crew, runtimes).
- Image URLs are dynamically constructed based on the TMDB configuration.

### RAWG (Video Games)
- Proxied through the backend, attaching the `RAWG_API_KEY`.
- Used to search for games and retrieve platform details, developers, and high-resolution screenshots.

### Cloudinary
- Used exclusively for avatar image uploads.
- The React client uploads images directly to Cloudinary using an unsigned upload preset to save backend bandwidth, storing only the resulting secure URL in the database.

---

## 🧠 7. AI Subsystem (Gemini)

The crown jewel of Neon Hub is the Gemini AI integration, enabling dynamic Recommendations and side-by-side Comparisons.

### Prompt Engineering
The AI controller constructs highly specific, strict prompts instructing Gemini to act as a media analyst and output *only* valid JSON conforming to a specific schema. 

### The Fallback Matrix
Free-tier AI models are prone to `429 Quota Exceeded` errors. Neon Hub solves this via a recursive fallback matrix:
```javascript
const MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-pro-latest',
  'gemini-2.0-flash'
];
```
If a request fails, the system executes an exponential backoff delay and retries using the next model in the list.

### AI Caching
To further preserve API quotas, the backend calculates a cryptographic hash of the exact prompt generated. Before calling Gemini, it checks the `ai_cache` table. If the hash exists, it instantly returns the cached JSON, bypassing the API entirely.

---

## ⚡ 8. Performance & Optimization

### Debouncing
Search inputs execute a custom `useDebounce` hook. Typing "B-a-t-m-a-n" rapidly will not fire 6 API requests; it waits 500ms after the final keystroke to execute a single, unified search.

### Node-Cache
The backend utilizes `node-cache` (an in-memory key-value store). Endpoints like `/api/movies/trending` are cached for 10 minutes. This means 1,000 concurrent users hitting the homepage will only result in 1 request to TMDB, drastically lowering latency and quota usage.

### Pagination
All library and search results utilize SQL `OFFSET` and `LIMIT` (or API pagination parameters) to avoid loading massive datasets into memory simultaneously.

---

## 🎨 9. Design System & UI

### Bootstrap 5 & Custom CSS
Neon Hub does not use pre-built themes. It utilizes raw Bootstrap 5 utility classes heavily modified by a custom design system defined in `main.css`.

- **CSS Variables:** Colors (`--color-bg-base`, `--color-accent-purple`), typography, and spacing are strictly controlled via CSS custom properties.
- **Glassmorphism:** Navigation bars and modals feature subtle `backdrop-filter: blur(10px)` effects for a modern, depth-focused UI.
- **RTL Support:** CSS logical properties (e.g., `margin-inline-start` instead of `margin-left`) ensure the layout perfectly flips when the user switches to the Arabic language context.
- **Animations:** All buttons, cards, and page transitions use `transition: all 0.2s ease` or custom `@keyframes fade-in` for a smooth, premium feel.
