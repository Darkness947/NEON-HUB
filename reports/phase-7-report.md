<div align="center">
  <img src="../client/src/assets/images/main_logo.png" alt="Neon Hub Logo" width="200" />
  <h1>Phase 7 Report: Reviews & Lists</h1>
  <p><strong>Neon Hub Development Report</strong></p>
  <hr />
</div>


## Overview
Phase 7 implemented full CRUD functionality for user reviews and custom lists. Users can now write detailed text reviews and rate media out of 10, view their reviews in a central hub, and curate cross-media custom lists (e.g. "My Top 10 Sci-Fi Properties", mixing movies and games). 

## ✅ Deliverables Completed
- [x] **Backend Models & Controllers**: Built `reviewModel.js` and `listModel.js`, along with corresponding controllers and validators to handle database operations securely.
- [x] **New Endpoints**:
  - `GET /api/reviews` (all reviews for the current user)
  - `GET /api/reviews/:mediaType/:mediaId` (all reviews for a specific media item)
  - `GET /api/lists`, `POST /api/lists`, `GET /api/lists/:id`, `PUT /api/lists/:id`, `DELETE /api/lists/:id`
  - `POST /api/lists/:id/items`, `DELETE /api/lists/:id/items`
- [x] **Frontend Services**: `reviewService.js` and `listService.js` to wrap the new APIs.
- [x] **Media Detail Integrations**: Added an inline review section, a "Write Review" modal, and an "Add to List" modal to the `MovieDetail.jsx`, `SeriesDetail.jsx`, and `GameDetail.jsx` pages.
- [x] **Dedicated Pages**:
  - `/reviews` (`MyReviews.jsx`) - Hub for managing written reviews.
  - `/lists` (`CustomLists.jsx`) - Hub for creating and viewing custom lists.
  - `/lists/:id` (`ListDetail.jsx`) - Interactive list view capable of rendering mixed `MediaCard` and `GameCard` components.

## 🧠 Technical Decisions
1. **Hydration Strategy for Reviews and Lists**: The `reviewModel` and `listModel` query the respective tracking tables to get minimal relational data (e.g., `tmdb_id`, `rawg_id`), which is then hydrated using `utils/hydrateItem.js`. This guarantees that metadata is always fresh without storing duplicated strings in the database.
2. **Review Storage**: Instead of a dedicated `reviews` table, the architecture correctly utilizes the existing `review` and `rating` columns on the tracking tables (`tracked_movies`, `tracked_series`, `tracked_games`). The "Review CRUD" operations simply update those fields. To get a unified view of all user reviews, `reviewModel.getUserReviews` uses a `UNION ALL` query across all three tables.

## ⚠️ Known Issues

> [!WARNING]
> / Next Steps
> - None. Reviews and Lists are fully operational. The application is now extremely feature-rich and ready for the final Phase 8 (UI Polish & Optimization).

