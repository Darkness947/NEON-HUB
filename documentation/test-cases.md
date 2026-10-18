<div align="center">
  <img src="../client/src/assets/images/main_logo.png" alt="Neon Hub Logo" width="200" />
  <h1>Neon Hub Test Cases Specification</h1>
  <p><strong>Comprehensive Test Case Repository & Execution Catalog</strong></p>
  <p><em>Version 1.0 — October 2026</em></p>
  <hr />
</div>

## 📑 Test Categories
- [1. Authentication & Security (AUTH)](#1-authentication--security-auth)
- [2. System & Health (SYS)](#2-system--health-sys)
- [3. Error Handling & Middlewares (ERR)](#3-error-handling--middlewares-err)
- [4. History & Recently Viewed (HIST)](#4-history--recently-viewed-hist)
- [5. Library & Tracking (LIB)](#5-library--tracking-lib)
- [6. Ratings, Reviews & Pagination (RATE)](#6-ratings-reviews--pagination-rate)
- [7. Core UI Components & Localization (UI)](#7-core-ui-components--localization-ui)

---

## 1. Authentication & Security (AUTH)

| Test ID | Test Title | Level | Pre-conditions | Test Steps | Expected Result | Status |
|---|---|---|---|---|---|---|
| **TC-AUTH-001** | Register with Valid Credentials | Integration | Database mock initialized | 1. Send `POST /api/auth/register` with unique email, username, and password.<br>2. Inspect response status and body. | HTTP 201 Created. Returns `{ success: true, data: { user } }` without password hash. | ✅ Passed |
| **TC-AUTH-002** | Register with Duplicate Email | Integration | Mock user already exists | 1. Send `POST /api/auth/register` with existing email. | HTTP 409 Conflict with error code `EMAIL_EXISTS`. | ✅ Passed |
| **TC-AUTH-003** | Register with Invalid Password | Integration | None | 1. Send `POST /api/auth/register` with 4-character password. | HTTP 400 Bad Request with validation message. | ✅ Passed |
| **TC-AUTH-004** | Login with Correct Credentials | Integration | User registered with bcrypt hash | 1. Send `POST /api/auth/login` with valid email & password. | HTTP 200 OK. Returns JWT `accessToken` and sets httpOnly `refreshToken` cookie. | ✅ Passed |
| **TC-AUTH-005** | Login with Incorrect Password | Integration | User registered | 1. Send `POST /api/auth/login` with wrong password. | HTTP 401 Unauthorized with error code `INVALID_CREDENTIALS`. | ✅ Passed |
| **TC-AUTH-006** | Reject Request without Bearer Token | Integration | None | 1. Send `GET /api/history/count` with no `Authorization` header. | HTTP 401 Unauthorized with error code `NO_TOKEN`. | ✅ Passed |
| **TC-AUTH-007** | Reject Request with Expired Token | Integration | Expired JWT token | 1. Send request with expired token in `Authorization` header. | HTTP 401 Unauthorized with error code `TOKEN_EXPIRED`. | ✅ Passed |

---

## 2. System & Health (SYS)

| Test ID | Test Title | Level | Pre-conditions | Test Steps | Expected Result | Status |
|---|---|---|---|---|---|---|
| **TC-SYS-001** | Render Health Check Endpoint | Integration | Server initialized | 1. Send `GET /health`. | HTTP 200 OK with `{ status: "ok", timestamp: ... }`. | ✅ Passed |
| **TC-SYS-002** | 404 Route Fallback | Integration | Server initialized | 1. Send `GET /api/nonexistent-route`. | HTTP 404 Not Found with standard error envelope. | ✅ Passed |

---

## 3. Error Handling & Middlewares (ERR)

| Test ID | Test Title | Level | Pre-conditions | Test Steps | Expected Result | Status |
|---|---|---|---|---|---|---|
| **TC-ERR-001** | Custom AppError Class Behavior | Unit | None | 1. Instantiate `new AppError("Not Found", 404, "NOT_FOUND")`.<br>2. Check properties. | `statusCode` is 404, `code` is `'NOT_FOUND'`, `isOperational` is true. | ✅ Passed |
| **TC-ERR-002** | asyncHandler Exception Catching | Unit | Express mock | 1. Pass async function that throws to `asyncHandler`.<br>2. Execute with mock `(req, res, next)`. | Thrown error is caught and forwarded to `next(err)`. | ✅ Passed |

---

## 4. History & Recently Viewed (HIST)

| Test ID | Test Title | Level | Pre-conditions | Test Steps | Expected Result | Status |
|---|---|---|---|---|---|---|
| **TC-HIST-001** | Get History Count Endpoint | Integration | Authenticated user | 1. Send `GET /api/history/count` with valid Bearer token.<br>2. Database returns mock count 5. | HTTP 200 OK with `{ success: true, data: { count: 5 } }`. | ✅ Passed |
| **TC-HIST-002** | Log Media Visit Endpoint | Integration | Authenticated user | 1. Send `POST /api/history/visit` with `{ media_type: "movie", media_id: 550 }`. | HTTP 200 OK with updated visit record. | ✅ Passed |
| **TC-HIST-003** | Reject Visit with Invalid Media Type | Integration | Authenticated user | 1. Send `POST /api/history/visit` with `{ media_type: "book", media_id: 123 }`. | HTTP 400 Bad Request with validation message. | ✅ Passed |
| **TC-HIST-004** | Client historyService Count Fetch | Unit | Mocked Axios instance | 1. Call `historyService.getHistoryCount()`.<br>2. Axios returns `{ data: { data: { count: 12 } } }`. | Resolves with integer `12`. | ✅ Passed |
| **TC-HIST-005** | Client historyService Error Fallback | Unit | Mocked Axios instance | 1. Call `historyService.getHistoryCount()`.<br>2. Axios throws network error. | Resolves gracefully with `0` (never crashes). | ✅ Passed |

---

## 5. Library & Tracking (LIB)

| Test ID | Test Title | Level | Pre-conditions | Test Steps | Expected Result | Status |
|---|---|---|---|---|---|---|
| **TC-LIB-001** | Prevent 400 Error on Recent Tab | Unit / UI | Library page rendered | 1. Switch active tab to `'recent'`.<br>2. Verify `libraryService.getLibrary` is NOT called with `'recent'`. | No network call to `/api/library?type=recent`. Zero 400 Bad Request console errors. | ✅ Passed |
| **TC-LIB-002** | Display All 4 Tab Badge Counts | UI Component | Library page loaded | 1. Render Library tabs.<br>2. Provide counts: Recent: 5, Movies: 10, Series: 3, Games: 2. | Rendered output shows `Recently Viewed (5)`, `Movies (10)`, `TV Series (3)`, `Games (2)`. | ✅ Passed |

---

## 6. Ratings, Reviews & Pagination (RATE)

| Test ID | Test Title | Level | Pre-conditions | Test Steps | Expected Result | Status |
|---|---|---|---|---|---|---|
| **TC-RATE-001** | "Load More" Button Proper Wording | UI Component | MyRatings rendered with `hasMore: true` | 1. Render MyRatings with 1 rating and total count 25.<br>2. Inspect pagination button text. | Button displays `"Load More (1 of 25)"` (never shows raw key `common.loadMore`). | ✅ Passed |
| **TC-RATE-003** | Arabic RTL Localization of Load More | UI Component | i18n language set to `'ar'` | 1. Render MyRatings with `hasMore: true` in Arabic. | Button displays `"تحميل المزيد (1 من 25)"`. | ✅ Passed |

---

## 7. Core UI Components & Localization (UI)

| Test ID | Test Title | Level | Pre-conditions | Test Steps | Expected Result | Status |
|---|---|---|---|---|---|---|
| **TC-UI-001** | EmptyState Component Rendering | UI Component | None | 1. Render `<EmptyState title="Your Library is Empty" message="Start discovering..." icon="📚" actionText="Start Exploring" actionLink="/discover" />`. | Title, message, icon, and action button are displayed with correct links. | ✅ Passed |
| **TC-UI-002** | MediaCard Title Truncation | UI Component | None | 1. Render MediaCard with long title (>35 chars). | Title is truncated cleanly with ellipsis (`...`) preventing layout overflow. | ✅ Passed |
| **TC-UI-003** | MediaCard Rating Badge Formatting | UI Component | None | 1. Render MediaCard with vote average 8.432.<br>2. Check score badge styling. | Badge renders with correct styling and formatted to 1 decimal place (`★ 8.4`). | ✅ Passed |

---

## 📊 Test Execution Summary

* **Total Test Cases Cataloged:** 22
* **Total Automated Tests Executed:** 34
* **Pass Rate:** **100% (34 / 34 Passed)**
* **Execution Time:** ~5.3s total across client and server
