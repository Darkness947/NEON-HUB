<div align="center">
  <img src="../client/src/assets/images/main_logo.png" alt="Neon Hub Logo" width="200" />
  <h1>Phase 5 Report: Library & Tracking System</h1>
  <p><strong>Neon Hub Development Report</strong></p>
  <hr />
</div>


## Overview
Phase 5 focused on building the core tracking system allowing users to add movies, series, and games to their personal libraries, manage statuses (e.g., watching, completed, planned), toggle favorites, and log their activity.

## ✅ Deliverables Completed
- **Backend Setup (`server/controllers/libraryController.js`, `server/models/libraryModel.js`, `server/models/activityModel.js`)**: 
  - Created endpoints for `/api/library/add`, `/update`, `/remove`, `/`, and `/favorites`.
  - Implemented data access layers using parameterized SQL queries.
  - Implemented `activityModel` to log user actions ("added_movie", "updated_game", etc.).
- **Validation (`server/validators/libraryValidator.js`)**:
  - Enforced strict constraints using `express-validator` to ensure media statuses and ratings are valid. Split validation into `validateLibraryAdd` and `validateLibraryUpdate` to properly handle optional status fields during updates.
- **Frontend Services (`client/src/services/libraryService.js`)**:
  - Created the API communication layer using the configured Axios instance.
- **Global State Management (`client/src/context/LibraryContext.jsx`)**:
  - Centralized library data (movies, series, games) to avoid prop-drilling and allow instantaneous UI updates.
- **UI Components**:
  - `StatusDropdown.jsx`: Reusable dropdown for setting tracking status.
  - `FavoriteButton.jsx`: Reusable heart icon for favoriting items.
  - Refactored `MediaCard` and detail pages to consume `LibraryContext`.
- **Frontend Pages**:
  - `Library.jsx`: Tabbed view for user's tracked movies, series, and games.
  - `Favorites.jsx`: Unified view for all favorited media.
  - `Dashboard.jsx`: Updated to reflect live counts from the library.

## Compliance Checklist
- [x] Every file exists and is non-empty.
- [x] No `TODO`, `FIXME`, or `console.log` statements in production paths.
- [x] Every new route is mounted in `server.js` and protected by `authMiddleware`.
- [x] Every route handler is wrapped in `asyncHandler()`.
- [x] All database queries use parameterized syntax (`$1`, `$2`).
- [x] All API responses follow the standard envelope format (`{ success: true, data: {...} }`).
- [x] Frontend API calls go through the single Axios instance (`api.js`).
- [x] Protected routes are wrapped in `<ProtectedRoute>` in `AppRouter.jsx`.
- [x] Loading and empty states are appropriately handled in the UI.

## 🧠 Technical Decisions
- **Validation Splitting**: The validation logic for library items was split into `validateLibraryAdd` and `validateLibraryUpdate`. This was necessary because the `status` field is strictly required when adding an item for the first time, but must be optional during updates (e.g., when a user only wants to toggle a favorite or update a rating).
- **Context-based Synchronization**: We elected to use a global `LibraryContext` to maintain the user's library state. This ensures that when a user favorites an item on the `MovieDetail` page, the change is immediately reflected on the `Favorites` page or any `MediaCard` on the screen without requiring a page reload or redundant API calls.

## Verification
- Manual verification was completed. Validation constraints operate as expected, correctly rejecting invalid schema updates and processing valid ones. The frontend successfully consumes the Context API to reflect instant state changes.

**Phase 5 is officially complete and compliant with AGENTS.md.**
