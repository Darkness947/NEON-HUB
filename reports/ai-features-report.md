<div align="center">
  <img src="../client/src/assets/images/main_logo.png" alt="Neon Hub Logo" width="200" />
  <h1>AI Features Implementation Report</h1>
  <p><strong>Neon Hub Development Report</strong></p>
  <hr />
</div>


## Overview
The AI Features implementation integrated the Gemini AI to provide intelligent insights based on the user's personal media library. The implementation focused on cost-efficiency, strict rate limiting handling, structured JSON outputs, and beautiful, responsive UI integration across English and Arabic layouts.

## Core Features Implemented

### 1. AI Recommendations (`/ai/recommendations/:mediaType`)
- **Taste Analysis**: Automatically analyzes up to 100 recent items in the user's library and deduces their taste in a concise summary.
- **Tailored Suggestions**: Suggests exactly 5 new, unseen media items (Movies, Series, or Games).
- **Reasoning**: Provides a short explanation for *why* the user will like it, and explicitly links the suggestion to 1-2 existing titles the user already enjoys.
- **Validation**: Requires the user to have at least 5 items in the specified media category to generate accurate recommendations.

### 2. AI Media Comparison (`/ai/compare/...`)
- **Compare Mode**: A dedicated toggle in the Library view that enters "Selection Mode". Users can check off exactly two items to compare.
- **Deep Analysis**: Breaks down the two selected items across multiple dimensions (Story, Characters, Visuals, Soundtrack, Themes).
- **Strengths & Weaknesses**: Extracts the pros and cons of both media items.
- **Final Verdict**: Offers an "AI Final Verdict" and a "Who Should Watch It?" recommendation to help users decide what to consume next.

---

## Technical Architecture

### Database & Caching (`ai_cache` table)
To respect the Gemini Free Tier API limits and avoid identical redundant requests, a custom caching layer was introduced.
- **Table Schema**: `id`, `user_id`, `feature`, `media_type`, `request_hash`, `response`, `created_at`.
- **Request Hash Logic**: 
  - For recommendations, the hash is derived from: `userId`, `mediaType`, and the `updated_at` timestamp of the latest modified item in their library. This ensures the cache automatically invalidates the moment the user adds, removes, or rates a new item.
  - For comparisons, the hash is derived from: `mediaType` and the sorted IDs of the two items being compared (ensuring A vs B hits the same cache as B vs A).

### The Gemini Integration (`server/config/gemini.js`)
- **Model Fallback**: Uses an ordered array of models (`gemini-2.5-flash`, `gemini-pro-latest`, etc.). If a model returns a `429 Quota Exhausted` error, the system instantly rotates to the next model.
- **Exponential Backoff**: If the API returns a `503 Service Unavailable`, the system automatically retries on the same model up to 3 times, doubling the wait time on each attempt.
- **Truncation Handling**: Automatically detects `MAX_TOKENS` finish reasons and falls back to a different model to ensure complete JSON payloads.
- **Structured JSON**: Prompts enforce strict JSON schemas. Responses are stripped of markdown formatting and parsed server-side to guarantee safe, structured data for the frontend.

### Frontend Flow & State Management
- **Library Selection Management**: The `Library.jsx` component tracks `isCompareMode` and `selectedItems`. A sticky bottom bar appears when in compare mode to provide easy access to the action button on mobile devices.
- **API Services**: `aiService.js` handles the network requests to the new backend endpoints.
- **Loaders & Error States**: Custom pulsing loading screens ("AI is analyzing your library...") keep the user engaged while waiting for the Gemini API (which can take 5-10 seconds).

---

## Localization & Internationalization
- All AI features fully support both English and Arabic.
- Dynamic string injection (e.g. `{{type}}`) is used for empty states.
- The UI maintains strict Right-To-Left (RTL) compatibility for all newly introduced side-by-side comparison grids and recommendation cards.

## Bug Fixes Applied During Development
- **Series Typo Bug**: Fixed a bug where `activeTab.slice(0, -1)` incorrectly truncated the word "series" into "serie", resulting in a 400 Bad Request error. Handled via a custom `getSingularType` helper.
- **Module Export Error**: Fixed a nodemon crash caused by incorrectly destructuring the `authMiddleware` import in `aiRoutes.js`.