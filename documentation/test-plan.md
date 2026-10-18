<div align="center">
  <img src="../client/src/assets/images/main_logo.png" alt="Neon Hub Logo" width="200" />
  <h1>Neon Hub Test Plan Document</h1>
  <p><strong>Quality Assurance & Testing Lifecycle Specification</strong></p>
  <p><em>Version 1.0 — October 2026</em></p>
  <hr />
</div>

## 📑 Table of Contents
1. [Overview & Objectives](#1-overview--objectives)
2. [Scope of Testing](#2-scope-of-testing)
3. [Testing Strategy & Levels](#3-testing-strategy--levels)
4. [Testing Architecture & Directory Structure](#4-testing-architecture--directory-structure)
5. [Tooling & Framework Selection](#5-tooling--framework-selection)
6. [Mocking & Test Isolation Strategy](#6-mocking--test-isolation-strategy)
7. [Environment Configurations](#7-environment-configurations)
8. [Pass / Fail Criteria & Defect Severity](#8-pass--fail-criteria--defect-severity)
9. [Continuous Integration & Automation](#9-continuous-integration--automation)

---

## 🎯 1. Overview & Objectives

The primary goal of this Test Plan is to establish a rigorous, repeatable, and automated testing framework for **Neon Hub**. 
Neon Hub is a production digital media tracking platform integrating external third-party APIs (TMDB, IGDB/RAWG), secure cloud storage (Cloudinary), PostgreSQL database persistence (Neon DB), and client-side single page navigation (React 19, Vite).

### Key Objectives:
- **Prevent Regressions:** Ensure new features and fixes never degrade existing functionality.
- **Isolate Environments:** Ensure tests run fast, locally, and in CI without consuming Neon DB connection limits or external API rate limits.
- **Maintain Session Security:** Guarantee JWT authentication, password hashing, and cookie policies function reliably across all supported browsers.
- **Automate Quality Gateways:** Gate all deployment builds via automated GitHub Actions CI before reaching production on Netlify or Render.

---

## 🔍 2. Scope of Testing

### In-Scope:
* **Backend API & Middleware:**
  * Authentication flows: registration, login, token refresh, authorization middleware.
  * Library & tracking services: movies, series, games status, ratings, reviews, favorites.
  * History & audit: recently viewed visit tracking and real-time count aggregation.
  * Error handling: operational errors, validation responses, 404s, and global async handler.
  * Health & system checks: Render health endpoints.
* **Frontend Web Application:**
  * Context providers: `AuthContext` and `LibraryContext`.
  * Service layer: `api.js` Axios interceptors, token injection, and retry queues.
  * Core UI components: `MediaCard`, `GameCard`, `EmptyState`, `Navbar`, `RecentlyViewed`.
  * Page views: `Library` tabs and counts, `MyRatings` pagination and localized wording.
  * Internationalization: Dual-language verification (English and Arabic RTL).
* **Continuous Integration:**
  * Automated testing workflows on GitHub Actions for client and server.
  * Production bundle verification (`vite build`).

### Out-of-Scope:
* Direct load/stress testing on third-party external APIs (TMDB/IGDB APIs are mocked).
* Manual cross-device visual snapshot testing (covered via component unit testing).

---

## 🧪 3. Testing Strategy & Levels

Neon Hub utilizes the testing pyramid model:

```
         / \
        / E2E \       <- Smoke & Journey Tests (Phase 2)
       /-------\
      / Integration \  <- Route & Controller Tests with Supertest
     /---------------\
    /   Unit Testing   \ <- Functions, Models, Contexts, UI Components
   /---------------------\
```

### Level 1: Unit Testing
* **Backend:** Isolated tests for utilities (`AppError`, `asyncHandler`), model query generators, and data sanitizers.
* **Frontend:** Utility functions, service API wrappers, custom hooks, and isolated UI components.

### Level 2: Integration Testing
* **Backend:** Supertest executes HTTP requests against Express routes (`/api/auth/*`, `/api/history/*`, `/health`). Tests assert response status codes, headers, and standard response envelopes `{ success, data }`.
* **Frontend:** Testing component interactions with React Testing Library (e.g., clicking pagination buttons, switching library tabs).

### Level 3: Continuous Integration & Smoke Testing
* GitHub Actions executes all unit and integration test suites on every `push` and `pull_request` targeting `main`.
* Verifies zero syntax errors, clean test exit codes (`0`), and successful client builds.

---

## 📁 4. Testing Architecture & Directory Structure

To maintain clean separation between the ES Module browser client and CommonJS Node server, the test suites are physically isolated:

```text
Neon Hub/
├── client/
│   ├── src/
│   │   ├── __tests__/
│   │   │   ├── components/
│   │   │   │   ├── EmptyState.test.jsx
│   │   │   │   └── MediaCard.test.jsx
│   │   │   ├── pages/
│   │   │   │   ├── MyRatings.test.jsx
│   │   │   │   └── LibraryTabs.test.jsx
│   │   │   └── services/
│   │   │       └── historyService.test.js
│   │   └── test/
│   │       └── setup.js
│   ├── vitest.config.js
│   └── package.json
│
├── server/
│   ├── tests/
│   │   ├── mocks/
│   │   │   └── dbMock.js
│   │   ├── unit/
│   │   │   ├── appError.test.js
│   │   │   └── historyModel.test.js
│   │   └── integration/
│   │       ├── auth.test.js
│   │       ├── health.test.js
│   │       └── history.test.js
│   ├── vitest.config.js
│   └── package.json
│
└── .github/
    └── workflows/
        └── ci.yml
```

---

## ⚙️ 5. Tooling & Framework Selection

| Target | Tool / Library | Role & Rationale |
|---|---|---|
| **Client Runner** | **Vitest** | Native Vite runner, instant start, ESM-first, Jest-compatible API. |
| **Client DOM** | **jsdom** | Simulates full browser DOM environment in Node. |
| **Client Testing** | **@testing-library/react** | Accessible, user-centric DOM assertions and query selectors. |
| **Client Matchers** | **@testing-library/jest-dom** | Extended DOM assertions (e.g. `toBeInTheDocument`, `toBeVisible`). |
| **Server Runner** | **Vitest** | Fast execution, unified testing syntax, CommonJS compatible. |
| **Server HTTP** | **Supertest** | High-level HTTP abstraction for Express integration testing. |
| **CI Automation** | **GitHub Actions** | Automated cloud pipeline triggered on Git events. |

---

## 🛡️ 6. Mocking & Test Isolation Strategy

### 1. Database Mocking (`server/tests/mocks/dbMock.js`)
Tests must **never** execute live SQL queries against Neon DB. A mock `pg.Pool` intercepts calls to `pool.query`:
* Returns mock rows tailored for each test case.
* Allows simulating database errors (e.g., unique key violation `23505`) to test error handling without touching the real database.

### 2. External Services Mocking
Third-party APIs (TMDB, IGDB, Cloudinary) are intercepted at the service layer:
* Axios requests in `tmdbService` and `igdbService` are mocked to return static JSON fixtures.
* Cloudinary file upload streams are mocked to return fixed URLs without network calls.

### 3. Frontend API Mocking
The client Axios instance (`src/services/api.js`) is mocked using `vi.spyOn` or module mock to deliver predetermined response envelopes `{ success: true, data: { ... } }`.

---

## 🌐 7. Environment Configurations

| Environment | Database Target | API Target | Mocking Active |
|---|---|---|---|
| **Local Development** | Neon DB (Dev instance) | Live Render / Local Express | No |
| **Local Automated Tests** | In-Memory Mock Pool | Supertest / Mocked Services | **Yes** |
| **GitHub Actions CI** | In-Memory Mock Pool | Supertest / Mocked Services | **Yes** |
| **Production** | Neon DB (Prod instance) | Render Web Service | No |

---

## 🚦 8. Pass / Fail Criteria & Defect Severity

### Pass Criteria:
1. 100% of all unit and integration test assertions pass (`exit code 0`).
2. Zero unhandled promise rejections or uncaught exceptions during test execution.
3. Production client build (`vite build`) completes with zero errors.
4. Total test execution time in CI finishes in under **2 minutes**.

### Defect Severity Matrix:
* **Blocker (Severity 1):** Authentication bypass, crash on startup, failure in production build.
* **Critical (Severity 2):** Database query errors, 400 Bad Request on major tabs, session loss on reload.
* **Major (Severity 3):** UI translation missing (e.g., raw key strings displayed), pagination failures.
* **Minor (Severity 4):** Animation stutter, non-blocking visual alignment glitches.

---

## 🚀 9. Continuous Integration & Automation

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every `push` and `pull_request` to `main`.
* **Parallel Execution:** Server and Client test suites run concurrently in separate jobs.
* **Dependency Caching:** GitHub actions cache `~/.npm` to minimize install times.
* **Deployment Guard:** Merges to `main` are blocked if any test fails, keeping Netlify and Render production deploys clean and stable.
