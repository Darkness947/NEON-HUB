# AGENTS.md — Neon Hub Operating Manual
### Antigravity AI Agent Companion Reference

> **How to use this file:** This document works alongside `NEONHUB_AGENT_PROMPT.txt` and the
> `NeonHub_Architecture_Document.pdf`. The prompt tells you *what* to build and *when*.
> The architecture document tells you *exactly* how it should look and work. This file tells
> you *how to think and operate* while building it — the reasoning patterns, code conventions,
> self-check protocols, and judgment calls you need to get it right.
>
> Read this file completely before starting Phase 1. Return to it whenever you are uncertain.

---

## Table of Contents

1. [Agent Identity & Operating Principles](#1-agent-identity--operating-principles)
2. [Decision-Making Hierarchy](#2-decision-making-hierarchy)
3. [The STOP Protocol — Full Specification](#3-the-stop-protocol--full-specification)
4. [Phase Gate Checklist](#4-phase-gate-checklist)
5. [Backend Code Conventions](#5-backend-code-conventions)
6. [Frontend Code Conventions](#6-frontend-code-conventions)
7. [Database Conventions](#7-database-conventions)
8. [Security Enforcement Patterns](#8-security-enforcement-patterns)
9. [Error Handling Patterns](#9-error-handling-patterns)
10. [API Response Standards](#10-api-response-standards)
11. [Naming Conventions](#11-naming-conventions)
12. [What "Done" Actually Means](#12-what-done-actually-means)
13. [Self-Audit Protocol](#13-self-audit-protocol)
14. [Common Failure Modes to Avoid](#14-common-failure-modes-to-avoid)
15. [Inter-Phase Dependency Map](#15-inter-phase-dependency-map)
16. [Quick Reference — Key Facts](#16-quick-reference--key-facts)

---

## 1. Agent Identity & Operating Principles

You are the **sole engineer** on this project. There is no reviewer to catch mistakes later.
There is no QA team. There is no second pass. Every file you write will go to production.
Operate accordingly.

### Your mental model of the human

The human is a **product owner, not a developer**. They understand what Neon Hub should do,
but they cannot debug a broken Express middleware or a misconfigured CORS header. When you
communicate with them:

- Use plain language. No jargon without explanation.
- Never say "it should work" — verify it actually works before reporting completion.
- When you need something from them (credentials, confirmations), be 100% specific about
  what to copy, where to find it, and exactly what to send back to you.
- Never ask them to make a technical decision that is your responsibility to make.

### What you are building

Neon Hub is a **real production application** — not a tutorial, not a portfolio toy.
Real users will register, track their media, and trust their data to be there the next day.
That shapes every decision: proper error handling, real security, persistent storage,
graceful degradation when external APIs fail.

### Your operating mode

You operate **phase by phase**. Inside a phase, you work **file by file**, completing
each file fully before moving on. You do not scaffold 20 empty files and fill them in later.
A file that exists must work.

---

## 2. Decision-Making Hierarchy

When you face any technical decision, resolve it in this order:

```
1. Architecture Document  →  Is the answer explicitly stated in the Document?
                              If yes: implement exactly that. No substitutions.

2. Agent Prompt           →  Is there a rule in the prompt covering this case?
                              If yes: follow it.

3. This file (AGENTS.md)  →  Is there a convention or pattern defined here?
                              If yes: apply it.

4. Engineering judgment   →  None of the above. Make the best production-grade
                              decision, document it in the phase report under
                              "Technical Decisions", and continue.
```

**You may never substitute a technology** from the defined stack without explicit instruction
from the human. The stack is: React + Vite, Bootstrap 5, Express, PostgreSQL (pg), JWT +
bcrypt, Cloudinary, Neon DB, Netlify, Render. These are fixed.

If a documented approach is genuinely impossible (a library is broken, an API endpoint no
longer exists), you must:
1. Stop.
2. Explain the exact problem clearly to the human.
3. Propose a specific, minimal compliant alternative.
4. Wait for approval before implementing the alternative.

---

## 3. The STOP Protocol — Full Specification

The STOP protocol is triggered any time a third-party service requires human action.
It is an absolute halt — no partial work, no "I'll set up the structure while waiting."

### Trigger conditions

Stop unconditionally when any of the following is needed and not yet provided:

| Service | What you need |
|---------|---------------|
| Neon DB | `DATABASE_URL` connection string |
| TMDB | `TMDB_API_KEY` |
| RAWG | `RAWG_API_KEY` |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Netlify | Deployed frontend URL |
| Render | Deployed backend URL |
| JWT Secret | `JWT_SECRET` (64+ char hex string) |

### Required output format

When you stop, output **exactly this block** and nothing else:

```
═══════════════════════════════════════════════════════════════
⏸  ACTION REQUIRED — I NEED YOU TO DO SOMETHING
═══════════════════════════════════════════════════════════════

Service:  [Name of the service]
Why:      [One sentence — what this enables in the project]

STEP-BY-STEP INSTRUCTIONS:

  STEP 1: [Exact action — URLs, button names, field names]
  STEP 2: [Continue until setup is complete]
  STEP N: [Last step always confirms what to send back]

What to send me when done:
  - [Variable name]: [Description of the value]
  - [Variable name]: [Description of the value]

I will resume automatically once you send the above.
═══════════════════════════════════════════════════════════════
```

### After the human responds

When you receive the values:
1. Acknowledge receipt: "Got it. Resuming Phase N."
2. Continue from **exactly where you stopped** — not from the beginning of the phase.
3. Do not re-explain what you already built.

---

## 4. Phase Gate Checklist

Before you declare a phase complete and write the report, run this checklist mentally.
A phase is **not complete** until every applicable item passes.

### Universal gates (every phase)

- [ ] Every file listed in the phase deliverables exists and is non-empty
- [ ] Every function does what its name says
- [ ] No `TODO`, `FIXME`, or placeholder comments in delivered code
- [ ] No `console.log` debug statements left in production code paths
      (startup logs and DB connection confirmations are acceptable)
- [ ] All new environment variables are in both `.env` (with real values, gitignored)
      and `.env.example` (with empty values, committed)
- [ ] No `.env` file would be committed if you ran `git add .` right now
- [ ] The phase report is written and saved to `/reports/phase-N-report.md`

### Backend-specific gates

- [ ] Every new route is mounted in `server.js`
- [ ] Every new protected route has `authMiddleware` applied
- [ ] Every route handler is wrapped in `asyncHandler()`
- [ ] Every database query uses parameterized syntax (`$1`, `$2`...)
- [ ] No API keys appear in any response sent to the frontend
- [ ] Endpoints return the standard response envelope (see Section 10)

### Frontend-specific gates

- [ ] No direct calls to TMDB or RAWG from any frontend file
- [ ] All API calls go through `src/services/api.js` (the single Axios instance)
- [ ] All new routes are registered in `AppRouter.jsx`
- [ ] Protected pages are wrapped in `<ProtectedRoute>`
- [ ] Loading states are shown while data fetches (skeleton or spinner)
- [ ] Empty states are shown when data returns empty
- [ ] No hardcoded backend URLs — all use `import.meta.env.VITE_API_URL`

---

## 5. Backend Code Conventions

### File organization within controllers

Every controller file follows this structure, in this order:

```javascript
// 1. Imports
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { validationResult } = require('express-validator');
const SomeModel = require('../models/someModel');

// 2. Helper functions (private to this file, prefixed with _)
const _formatResponse = (data) => { ... };

// 3. Exported handler functions (one per route action)
const createThing = asyncHandler(async (req, res) => { ... });
const getThing    = asyncHandler(async (req, res) => { ... });

// 4. Module exports
module.exports = { createThing, getThing };
```

### The asyncHandler pattern

Every route handler **must** be wrapped. Never use try-catch in controllers directly.

```javascript
// utils/asyncHandler.js — write it exactly like this
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
module.exports = asyncHandler;
```

### The AppError pattern

```javascript
// utils/AppError.js — write it exactly like this
class AppError extends Error {
  constructor(message, statusCode, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
```

Usage in controllers:

```javascript
// throw operational errors like this — asyncHandler catches them
if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
if (duplicate) throw new AppError('Already in your library', 409, 'DUPLICATE_ENTRY');
```

### Validation handling pattern

Check validation results at the top of every mutating handler:

```javascript
const createSomething = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    throw new AppError(first.msg, 400, 'VALIDATION_ERROR');
  }
  // ... rest of handler
});
```

### Model function signatures

Models are thin data-access layers. They do one thing: query the database and return data.
No business logic in models. Business logic goes in controllers.

```javascript
// Good — model just queries
const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT id, username, email, avatar_url, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

// Bad — business logic crept into the model
const loginUser = async (email, password) => {
  const user = await pool.query(...);
  const valid = await bcrypt.compare(password, user.password); // belongs in controller
  return valid ? user : null;
};
```

### Service layer (TMDB / RAWG)

Service functions handle the outbound HTTP call and clean the response.
They never know about `req` or `res`. They take plain arguments and return plain data.

```javascript
// services/tmdbService.js pattern
const axios = require('axios');
const cache = require('../config/cache');

const TMDB_BASE  = process.env.TMDB_BASE_URL;
const API_KEY    = process.env.TMDB_API_KEY;
const IMAGE_BASE = process.env.TMDB_IMAGE_BASE_URL;

// Always build image URLs in the service, never in the controller
const buildImageUrl = (path, size = 'w500') =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;

const getTrendingMovies = async () => {
  const cacheKey = 'trending_movies';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${TMDB_BASE}/trending/movie/week`, {
    params: { api_key: API_KEY },
    timeout: 8000,
  });

  const cleaned = data.results.map((m) => ({
    tmdb_id:      m.id,
    title:        m.title,
    poster_url:   buildImageUrl(m.poster_path),
    backdrop_url: buildImageUrl(m.backdrop_path, 'w1280'),
    release_date: m.release_date,
    vote_average: m.vote_average,
    overview:     m.overview,
    genre_ids:    m.genre_ids,
  }));

  cache.set(cacheKey, cleaned, 600); // 10 minutes TTL
  return cleaned;
};
```

---

## 6. Frontend Code Conventions

### The Axios instance — one instance, no exceptions

`src/services/api.js` is the **only place** HTTP calls are configured.
Never import `axios` directly in a component or page. Always import from `../services/api`.

```javascript
// src/services/api.js — the complete instance
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // required for httpOnly refresh token cookie
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = window.__accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401: attempt refresh, retry once
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry  = true;
      isRefreshing     = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        window.__accessToken = newToken;
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        window.__accessToken = null;
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

> **Token storage rationale:** Access tokens live in `window.__accessToken` (memory only —
> never localStorage or sessionStorage). Refresh tokens live in an httpOnly cookie managed
> by the backend. XSS cannot steal the refresh token. The access token disappears on tab close.

### Context structure

Every context follows this pattern exactly:

```jsx
// context/AuthContext.jsx — canonical pattern
import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import FullPageLoader from '../components/common/Loader';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,      setUser]      = useState(null);
  const [isLoading, setIsLoading] = useState(true); // blocks render until session known

  useEffect(() => {
    authService.refreshToken()
      .then(({ user, accessToken }) => {
        setUser(user);
        window.__accessToken = accessToken;
      })
      .catch(() => { /* no active session — stay logged out */ })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    const { user, accessToken } = await authService.login(email, password);
    window.__accessToken = accessToken;
    setUser(user);
  };

  const logout = async () => {
    await authService.logout();
    window.__accessToken = null;
    setUser(null);
  };

  if (isLoading) return <FullPageLoader />;

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
```

### Component file structure

Every component file follows this order without exception:

```jsx
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party imports
import { Link } from 'react-router-dom';

// 3. Internal imports (hooks, services, utils, other components)
import { useAuth }    from '../../hooks/useAuth';
import { useLibrary } from '../../hooks/useLibrary';
import { truncateText } from '../../utils/truncateText';

// 4. Component definition (named function, default export at bottom)
const MediaCard = ({ tmdb_id, title, poster_url, release_date, vote_average, media_type }) => {
  // 4a. Hooks first
  const { isAuthenticated } = useAuth();
  const { isInLibrary }     = useLibrary();
  const [isHovered, setIsHovered] = useState(false);

  // 4b. Derived values
  const year         = release_date?.slice(0, 4) ?? '—';
  const displayTitle = truncateText(title, 40);
  const inLibrary    = isInLibrary(media_type, tmdb_id);

  // 4c. Event handlers
  const handleAddToLibrary = () => { ... };

  // 4d. Render
  return ( ... );
};

// 5. Default export last
export default MediaCard;
```

### ProtectedRoute pattern

```jsx
// routes/AppRouter.jsx — ProtectedRoute using React Router v6 Outlet pattern
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Usage in router:
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/library"   element={<Library />} />
  {/* ... all protected routes */}
</Route>
```

### Page-level data fetching pattern

Every page that fetches data follows this pattern — no exceptions:

```jsx
const SomePage = () => {
  const [data,      setData]      = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        const result = await someService.fetchSomething();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; }; // prevent state update after unmount
  }, []);

  if (isLoading) return <SkeletonGrid count={10} />;
  if (error)     return <ErrorBanner message={error} />;
  if (!data.length) return <EmptyState title="Nothing here yet" message="..." />;
  return ( /* render data */ );
};
```

---

## 7. Database Conventions

### Pool configuration

```javascript
// config/db.js — write it exactly like this
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // REQUIRED for Neon DB — do not remove
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Startup connection test — exits if DB is unreachable
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Database connected to Neon DB');
  }
});

module.exports = pool;
```

### Query patterns

**Simple query:**
```javascript
const result = await pool.query(
  'SELECT id, username, email FROM users WHERE id = $1',
  [userId]
);
return result.rows[0] || null;
```

**Insert with RETURNING:**
```javascript
const result = await pool.query(
  `INSERT INTO tracked_movies (user_id, tmdb_id, status)
   VALUES ($1, $2, $3)
   RETURNING *`,
  [userId, tmdbId, status]
);
return result.rows[0];
```

**Conditional partial update (dynamic SET clause):**
```javascript
const updateLibraryItem = async (userId, tmdbId, fields) => {
  const allowed = ['status', 'rating', 'review', 'favorite', 'watched_at'];
  const updates = [];
  const values  = [];
  let i = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = $${i}`);
      values.push(fields[key]);
      i++;
    }
  }

  if (updates.length === 0) return null;

  values.push(userId, tmdbId);
  const result = await pool.query(
    `UPDATE tracked_movies
     SET ${updates.join(', ')}
     WHERE user_id = $${i} AND tmdb_id = $${i + 1}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
};
```

**Paginated query:**
```javascript
const getMovies = async (userId, status = null, page = 1, limit = 20) => {
  const offset     = (page - 1) * limit;
  const conditions = ['user_id = $1'];
  const values     = [userId];
  let i = 2;

  if (status) {
    conditions.push(`status = $${i}`);
    values.push(status);
    i++;
  }

  values.push(limit, offset);

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT * FROM tracked_movies
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      values
    ),
    pool.query(
      `SELECT COUNT(*) FROM tracked_movies WHERE ${conditions.join(' AND ')}`,
      values.slice(0, -2)
    ),
  ]);

  return {
    items:   dataResult.rows,
    total:   parseInt(countResult.rows[0].count),
    page,
    hasMore: offset + limit < parseInt(countResult.rows[0].count),
  };
};
```

---

## 8. Security Enforcement Patterns

### bcrypt usage

```javascript
// Hashing — always 12 rounds for passwords
const hash = await bcrypt.hash(password, 12);

// Comparing — bcrypt is timing-safe by design
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
if (!isValid) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
```

### JWT issuance and verification

```javascript
// Issue access token
const issueAccessToken = (userId) =>
  jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN, algorithm: 'HS256' }
  );

// Verify in authMiddleware
const authMiddleware = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401, 'NO_TOKEN');
  }
  const token   = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws on invalid/expired
  req.user      = { id: decoded.userId };
  next();
});
```

### Refresh token lifecycle

```javascript
// Generate: opaque random bytes (never a JWT — a JWT can be validated offline)
const rawToken = require('crypto').randomBytes(32).toString('hex');

// Store: hash before saving — if DB is breached, raw tokens are useless
const tokenHash = await bcrypt.hash(rawToken, 10); // 10 rounds OK for tokens
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

await pool.query(
  'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
  [userId, tokenHash, expiresAt]
);

// Send the RAW token in an httpOnly cookie — NEVER the hash
res.cookie('refreshToken', rawToken, {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000,
});

// Verify on refresh request
const rows  = await pool.query(
  'SELECT * FROM refresh_tokens WHERE user_id = $1 AND expires_at > NOW()',
  [userId]
);
const match = rows.rows.find((row) => bcrypt.compareSync(rawToken, row.token_hash));
if (!match) throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
```

### Rate limiting

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            5,
  message: {
    success: false,
    error: {
      code:    'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please try again in 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

module.exports = { loginLimiter };

// Apply in routes/auth.js:
// router.post('/login', loginLimiter, authValidator.login, authController.login);
```

---

## 9. Error Handling Patterns

### Global error handler

```javascript
// middleware/errorHandler.js — mount LAST in server.js
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${err.message}`);

  // Operational errors (AppError instances)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  // PostgreSQL: unique constraint violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_ENTRY', message: 'This entry already exists.' },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid authentication token.' },
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_EXPIRED', message: 'Authentication token has expired.' },
    });
  }

  // Unknown programmer errors — generic message in production
  return res.status(500).json({
    success: false,
    error: {
      code:    'SERVER_ERROR',
      message: process.env.NODE_ENV === 'development'
        ? err.message
        : 'An unexpected error occurred. Please try again.',
    },
  });
};

module.exports = errorHandler;
```

### Frontend error extraction pattern

In all service files:

```javascript
const login = async (email, password) => {
  try {
    const { data } = await api.post('/api/auth/login', { email, password });
    return data.data;
  } catch (err) {
    const message = err.response?.data?.error?.message
      ?? err.message
      ?? 'Login failed. Please try again.';
    throw new Error(message);
  }
};
```

In all components that call services:

```javascript
const handleLogin = async () => {
  try {
    await login(email, password);
    toast.success('Welcome back!');
    navigate('/dashboard');
  } catch (err) {
    toast.error(err.message);
  }
};
```

---

## 10. API Response Standards

Every backend response uses one of these two envelopes. Never deviate.

### Success responses

```javascript
// Standard data
res.status(200).json({ success: true, data: { ... } });

// Created resource
res.status(201).json({ success: true, data: newItem });

// Paginated list
res.status(200).json({
  success:    true,
  data:       items,
  pagination: { page, limit, total, hasMore },
});

// Successful delete / no content
res.status(200).json({ success: true, data: null, message: 'Item removed.' });
```

### Error response

```json
{
  "success": false,
  "error": {
    "code":    "VALIDATION_ERROR",
    "message": "Email is invalid.",
    "field":   "email"
  }
}
```

### HTTP status codes

| Code | When to use |
|------|-------------|
| `200` | Successful GET, PUT, DELETE |
| `201` | Successful POST creating a resource |
| `400` | Validation error, malformed body |
| `401` | No token, invalid token, expired token |
| `403` | Valid token but wrong permissions |
| `404` | Resource not found |
| `409` | Conflict — duplicate entry |
| `429` | Rate limit exceeded |
| `500` | Unhandled server error |
| `503` | External API (TMDB/RAWG) unavailable |

---

## 11. Naming Conventions

### Files and directories

| Type | Convention | Example |
|------|------------|---------|
| React components | PascalCase `.jsx` | `MediaCard.jsx`, `StatsCard.jsx` |
| React pages | PascalCase `.jsx` | `MovieDetail.jsx`, `Dashboard.jsx` |
| React hooks | camelCase, `use` prefix `.js` | `useDebounce.js`, `useLibrary.js` |
| React contexts | PascalCase, `Context` suffix `.jsx` | `AuthContext.jsx` |
| Frontend services | camelCase, `Service` suffix `.js` | `authService.js` |
| Backend controllers | camelCase, `Controller` suffix `.js` | `authController.js` |
| Backend models | camelCase, `Model` suffix `.js` | `userModel.js` |
| Backend routes | camelCase noun `.js` | `auth.js`, `movies.js` |
| Backend services | camelCase, `Service` suffix `.js` | `tmdbService.js` |
| Backend middleware | camelCase, `Middleware` suffix `.js` | `authMiddleware.js` |
| Backend validators | camelCase, `Validator` suffix `.js` | `authValidator.js` |
| Utility files | camelCase, descriptive `.js` | `asyncHandler.js`, `formatDate.js` |
| Phase reports | kebab-case `.md` | `phase-1-report.md` |

### Variables and functions

| Type | Convention | Example |
|------|------------|---------|
| React components | PascalCase | `const MediaCard = () =>` |
| Custom hooks | camelCase, `use` prefix | `const useDebounce = ()` |
| Event handlers | camelCase, `handle` prefix | `handleAddToLibrary` |
| Boolean state/props | camelCase, `is`/`has`/`can` prefix | `isLoading`, `isFavorite` |
| Async functions | camelCase, verb-first | `fetchTrendingMovies`, `createUser` |
| Module-level constants | SCREAMING_SNAKE_CASE | `const MAX_FILE_SIZE = 2097152` |
| Private module helpers | camelCase, `_` prefix | `const _buildImageUrl = ()` |
| CSS custom properties | `--category-name` | `var(--color-accent-purple)` |
| Error codes | SCREAMING_SNAKE_CASE | `'DUPLICATE_ENTRY'`, `'INVALID_TOKEN'` |

### Database

| Type | Convention | Example |
|------|------------|---------|
| Table names | snake_case, plural | `tracked_movies`, `custom_lists` |
| Column names | snake_case | `user_id`, `tmdb_id`, `created_at` |
| Index names | `idx_table_column` | `idx_tracked_movies_user` |
| FK columns | `singular_referenced_table_id` | `user_id`, `list_id` |

### API routes

| Type | Convention | Example |
|------|------------|---------|
| Resource paths | kebab-case, plural nouns | `/api/custom-lists` |
| Action paths | kebab-case verbs | `/api/library/add`, `/api/auth/forgot-password` |
| ID parameters | `:resource_id` | `/api/movies/:tmdb_id`, `/api/lists/:id` |
| Query params | camelCase | `?mediaType=movie&page=2` |

---

## 12. What "Done" Actually Means

### Phase-level definition of done

A phase is done when **all three** of these are true:

**1. It works end-to-end.**
You have verified the user-facing flow described in the "DONE WHEN" section of the
prompt, not just that the code compiles. Run the flow yourself before writing the report.

**2. Edge cases are handled.**
For every feature in the phase, verify:
- What happens when input is invalid or missing?
- What happens when the API call fails or times out?
- What happens when the user is not authenticated?
- What happens when the returned data is empty?

**3. The report is written.**
`/reports/phase-N-report.md` exists with all required sections filled with real
content — not template placeholders. "N/A" is acceptable for empty sections.
"TODO" is not.

### Feature-level definition of done

A feature is done when:

- Backend endpoint returns correct data and status codes for success AND failure
- Frontend displays the data correctly
- Loading state shown while fetching
- Error state shown if the request fails
- Empty state shown if data is empty
- Toast fires on every user-triggered mutation
- Feature works at 375px mobile viewport

---

## 13. Self-Audit Protocol

Run these checks before writing any phase report.

### Code audit — run these searches, expect zero matches

```bash
# SQL injection risk — template literals in query() calls
grep -rn "pool\.query(\`" server/

# API keys in frontend
grep -rn "TMDB_API_KEY\|RAWG_API_KEY\|api_key" client/src/

# Direct external API calls from frontend
grep -rn "themoviedb\.org\|api\.rawg\.io" client/src/

# localStorage token storage (security issue)
grep -rn "localStorage\.set\|sessionStorage\.set" client/src/

# Hardcoded backend URLs in frontend
grep -rn "localhost:5000\|onrender\.com" client/src/

# Unhandled async route handlers (missing asyncHandler wrapper)
grep -rn "router\.\(get\|post\|put\|delete\)('" server/routes/ | grep -v "asyncHandler"

# Debug logs left in controller files
grep -rn "console\.log" server/controllers/

# TODO or placeholder stubs
grep -rn "TODO\|FIXME\|placeholder\|coming soon" server/ client/src/
```

### Database audit — run in Neon DB SQL editor

```sql
-- All 9 tables must exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- All 6 indexes must exist
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- All FK relationships must cascade on delete
SELECT tc.constraint_name, tc.table_name, kcu.column_name,
       ccu.table_name AS foreign_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### Security audit — before Phase 9 deployment

```bash
# Verify .env is gitignored in both packages
grep "\.env" server/.gitignore
grep "\.env" client/.gitignore

# Verify .env files don't appear in git tracking
git ls-files | grep "\.env$"      # should return nothing

# Verify .env.example files ARE tracked
git ls-files | grep "\.env\.example"  # should show both files

# Verify no secrets in committed files
git grep -i "your_secret\|your_key\|paste_here" -- "*.example"
```

---

## 14. Common Failure Modes to Avoid

### Backend failure modes

**1. Forgetting to mount a router in server.js**
You write a perfect route file but forget `app.use('/api/something', router)`.
Everything exists. Nothing is reachable. Always check `server.js` after adding a route file.

**2. Missing `await` on async model calls**
```javascript
// Bug: result is a Promise object, not the data
const user = userModel.findUserByEmail(email);
if (!user) throw new AppError('Not found', 404); // never throws — Promise is truthy

// Fix
const user = await userModel.findUserByEmail(email);
```

**3. Sending the password hash to the frontend**
Never `SELECT *` on the users table when building a response. Always explicitly list
columns and omit `password`, `reset_token`, `reset_token_expires`.

**4. Unchecked empty query results**
```javascript
// Bug — crashes if no row found
const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
return rows[0].email; // TypeError: Cannot read properties of undefined

// Fix — check before accessing
if (!rows[0]) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
return rows[0].email;
```

**5. CORS misconfiguration on Render**
`FRONTEND_URL` in Render's environment variables must be the exact Netlify URL — correct
protocol (`https://`), no trailing slash. A single character difference silently breaks
all cross-origin requests with no helpful error.

**6. Forgetting SSL for Neon DB**
Without `ssl: { rejectUnauthorized: false }` in the Pool config, Neon DB connections
fail in production. The error looks like a generic connection refused.

### Frontend failure modes

**1. Flash of unauthenticated state on reload**
If `AuthProvider` sets `isLoading = false` before the silent refresh resolves, protected
routes will flash the login redirect before restoring the session. The `useEffect` refresh
must keep `isLoading = true` until it settles — and the app must show a full-page loader
during that window.

**2. Stale LibraryContext after mutations**
After `addToLibrary`, `updateItem`, or `removeFromLibrary`, update the context's in-memory
state immediately — don't wait for a re-fetch. The user must see the change instantly.
If the API call fails, roll the state back and show an error toast.

**3. Multiple Axios instances**
Any file that does `import axios from 'axios'` and calls `axios.get()` directly bypasses
the auth interceptor. That request gets no token and no automatic refresh. Every API call
must go through the configured instance in `src/services/api.js`.

**4. Missing `withCredentials: true`**
The httpOnly refresh token cookie is only sent with requests if `withCredentials: true`
is set on the Axios instance. Without it, every page reload logs the user out silently.

**5. React Router v6 API misuse**
- Nested routes: use `<Outlet />`, not `{children}`
- Redirect: use `<Navigate to="..." replace />`, not `<Redirect>`
- Programmatic nav: use `const navigate = useNavigate()`, not `history.push()`
- Route params: `const { id } = useParams()`, not `props.match.params.id`

**6. VITE_ prefix missing from env variables**
Vite only exposes variables prefixed with `VITE_` to the browser bundle. A variable named
`API_URL` will be `undefined` in the frontend. It must be `VITE_API_URL`.

### Deployment failure modes

**1. React Router 404 on Netlify refresh**
Without `netlify.toml` containing the `[[redirects]]` rule, any direct URL or browser
refresh returns Netlify's 404 page. This file must exist before the first deploy.

**2. Vite env variables baked at build time**
`import.meta.env.VITE_API_URL` is resolved at build time — not runtime. Changing the
Netlify environment variable without re-deploying has no effect. Always trigger a new deploy
after changing Netlify env vars.

**3. Render cold starts**
The Render free tier spins down after 15 minutes of inactivity. The first request after
spin-down takes 30–60 seconds. UptimeRobot pinging `/health` every 5 minutes prevents this.
Tell the human to set this up in Phase 9.

---

## 15. Inter-Phase Dependency Map

Each phase builds on the previous. A bug in an earlier phase will surface as a broken
feature in a later one. Use this map to trace the root cause when something doesn't work.

```
Phase 1 — Scaffolding
  Provides: server running, DB connected, folder structure, .env pattern, /health
  Required by: ALL phases

Phase 2 — Authentication
  Requires: Phase 1 + JWT_SECRET + DATABASE_URL
  Provides: authMiddleware, AuthContext, ProtectedRoute, user sessions
  Required by: Phases 5, 6, 7, 8 (all protected features)

Phase 3 — TMDB (Movies & Series)
  Requires: Phase 1 + TMDB_API_KEY
  Provides: tmdbService, MediaCard, movie/series pages, search
  Required by: Phase 5 (tmdb_id is what gets tracked)

Phase 4 — RAWG (Games)
  Requires: Phase 1 + RAWG_API_KEY
  Provides: rawgService, GameCard, game pages, game search
  Required by: Phase 5 (rawg_id is what gets tracked)

Phase 5 — Library
  Requires: Phases 2 + 3 + 4 all complete
  Provides: tracked_* tables populated, activity_log writes, LibraryContext
  Required by: Phase 6 (dashboard reads from library tables)

Phase 6 — Dashboard
  Requires: Phase 5 complete (needs real data to display)
  Provides: analytics, stats, activity feed
  Required by: nothing (standalone feature)

Phase 7 — Reviews & Lists
  Requires: Phases 2 + 3 + 4 + 5 complete
  Provides: review CRUD, custom list CRUD
  Required by: nothing (standalone feature)

Phase 8 — Polish + Cloudinary
  Requires: ALL previous phases + CLOUDINARY credentials
  Provides: avatar upload, skeleton loaders, toasts, empty states, a11y, password reset
  Required by: Phase 9 (must be complete before deploying)

Phase 9 — Deployment
  Requires: Phase 8 complete + Netlify account + Render account
  Provides: live production URLs
  Required by: nothing (final phase)
```

---

## 16. Quick Reference — Key Facts

### Local development URLs

| Service | URL |
|---------|-----|
| Frontend (Vite) | `http://localhost:5173` |
| Backend (Express) | `http://localhost:5000` |
| Health check | `http://localhost:5000/health` |

### External API base URLs (backend only — never in frontend)

| API | Base URL | Image URL |
|-----|----------|-----------|
| TMDB | `https://api.themoviedb.org/3` | `https://image.tmdb.org/t/p` |
| RAWG | `https://api.rawg.io/api` | Use `background_image` field directly |

### Image URL construction

```javascript
// TMDB — poster (card)
`https://image.tmdb.org/t/p/w500${poster_path}`

// TMDB — backdrop (hero/detail)
`https://image.tmdb.org/t/p/w1280${backdrop_path}`

// TMDB — cast profile photo
`https://image.tmdb.org/t/p/w185${profile_path}`

// Cloudinary avatar — auto face-crop to 200x200 on delivery
// Append transformation string into the URL before the filename:
// https://res.cloudinary.com/{cloud_name}/image/upload/c_fill,g_face,h_200,w_200/{public_id}
```

### Status enums (must match DB CHECK constraints exactly)

```javascript
const MOVIE_SERIES_STATUSES = ['watching', 'completed', 'planned', 'paused', 'dropped'];
const GAME_STATUSES         = ['playing',  'completed', 'backlog', 'paused', 'dropped'];

// Status → CSS variable (use these in StatusDropdown and status pills)
const STATUS_COLORS = {
  watching:  'var(--color-accent-blue)',   // #00B4D8
  playing:   'var(--color-accent-blue)',   // #00B4D8
  completed: 'var(--color-success)',       // #2D9E5F
  planned:   'var(--color-accent-purple)', // #7B2FBE
  backlog:   'var(--color-accent-purple)', // #7B2FBE
  paused:    'var(--color-accent-amber)',  // #F4A261
  dropped:   'var(--color-danger)',        // #E53E3E
};
```

### Activity log action name constants

```javascript
// Use exactly these strings in activityModel.logActivity() calls
// Format: verb_mediatype (all lowercase, underscore-separated)

const ACTIVITY_ACTIONS = {
  ADDED:     (type) => `added_${type}`,      // 'added_movie'
  UPDATED:   (type) => `updated_${type}`,    // 'updated_series'
  REMOVED:   (type) => `removed_${type}`,    // 'removed_game'
  RATED:     (type) => `rated_${type}`,      // 'rated_movie'
  COMPLETED: (type) => `completed_${type}`,  // 'completed_game'
  FAVORITED: (type) => `favorited_${type}`,  // 'favorited_series'
};
// type is always one of: 'movie', 'series', 'game'
```

### CSS design tokens (implement in `/client/src/styles/main.css`)

```css
:root {
  /* Backgrounds */
  --color-bg-deep:       #0D0D1A;
  --color-bg-surface:    #1A1A2E;
  --color-bg-elevated:   #16213E;

  /* Accents */
  --color-accent-purple: #7B2FBE;
  --color-accent-blue:   #00B4D8;
  --color-accent-amber:  #F4A261;

  /* Text */
  --color-text-primary:  #E8E8F0;
  --color-text-muted:    #9A9AB0;

  /* Status */
  --color-success:       #2D9E5F;
  --color-danger:        #E53E3E;

  /* Typography */
  --font-display: 'Space Grotesk', sans-serif;
  --font-body:    'Inter', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
}
```

### server.js middleware order (order is critical — never rearrange)

```javascript
// 1. Security headers — must be first
app.use(helmet());

// 2. CORS — before routes
app.use(cors({
  origin:      [process.env.FRONTEND_URL, 'http://localhost:5173'],
  credentials: true,
}));

// 3. Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// 4. Health check (no auth, no rate limit)
app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// 5. API routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/movies',    require('./routes/movies'));
app.use('/api/series',    require('./routes/series'));
app.use('/api/games',     require('./routes/games'));
app.use('/api/library',   require('./routes/library'));
app.use('/api/reviews',   require('./routes/reviews'));
app.use('/api/lists',     require('./routes/lists'));
app.use('/api/dashboard', require('./routes/dashboard'));

// 6. Unknown route handler
app.use('*', (req, res) =>
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found.' },
  })
);

// 7. Global error handler — must be LAST
app.use(require('./middleware/errorHandler'));
```

### netlify.toml — exact content, no modifications

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### All environment variable names (complete list)

```bash
# server/.env
PORT=
NODE_ENV=
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
REFRESH_TOKEN_EXPIRES_IN=
TMDB_API_KEY=
TMDB_BASE_URL=
TMDB_IMAGE_BASE_URL=
RAWG_API_KEY=
RAWG_BASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=

# client/.env
VITE_API_URL=
```

### Cloudinary multer storage — exact configuration

```javascript
// middleware/cloudinaryMiddleware.js
const cloudinary          = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer              = require('multer');
const AppError            = require('../utils/AppError');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id:       (req) => `user-${req.user.id}`, // overwrites on re-upload
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB hard limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only JPG, PNG, and WebP images are allowed.', 400, 'INVALID_FILE_TYPE'));
    }
  },
});

module.exports = upload.single('avatar');
```

### Neon DB SSL requirement

```javascript
// This line in db.js is non-negotiable for Neon DB connections
ssl: { rejectUnauthorized: false }
// Without it: ECONNREFUSED or SSL SYSCALL error on Render
```

---

*AGENTS.md v1.0 — Neon Hub | June 2026*
*Read the prompt. Follow the Document. Use this file. Build something real.*
