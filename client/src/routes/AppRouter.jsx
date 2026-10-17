import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layout (eagerly loaded)
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FullPageLoader from '../components/common/Loader';

// Core entry pages (eagerly loaded for instant first paint)
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Lazy-loaded pages (code-split into separate on-demand chunks)
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Discover = lazy(() => import('../pages/Discover'));
const MovieDetail = lazy(() => import('../pages/movies/MovieDetail'));
const SeriesDetail = lazy(() => import('../pages/series/SeriesDetail'));
const GameDetail = lazy(() => import('../pages/games/GameDetail'));
const SearchResults = lazy(() => import('../pages/SearchResults'));
const Library = lazy(() => import('../pages/library/Library'));
const Favorites = lazy(() => import('../pages/favorites/Favorites'));
const CustomLists = lazy(() => import('../pages/lists/CustomLists'));
const ListDetail = lazy(() => import('../pages/lists/ListDetail'));
const MyReviews = lazy(() => import('../pages/reviews/MyReviews'));
const Profile = lazy(() => import('../pages/profile/Profile'));
const Settings = lazy(() => import('../pages/profile/Settings'));
const MyRatings = lazy(() => import('../pages/profile/MyRatings'));
const Contact = lazy(() => import('../pages/Contact'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../pages/TermsOfService'));
const AiRecommendations = lazy(() => import('../pages/ai/AiRecommendations'));
const AiComparison = lazy(() => import('../pages/ai/AiComparison'));
const NotFound = lazy(() => import('../pages/NotFound'));

// ─── Protected Route Wrapper ──────────────────────────────────────────────────
// Shows loader ONLY for protected pages while auth is resolving
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <FullPageLoader />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// ─── Guest Only Route (redirect to dashboard if already logged in) ────────────
const GuestRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <FullPageLoader />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

// ─── Main Layout (with Navbar and Footer) ─────────────────────────────────────
const MainLayout = () => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <main style={{ flex: 1 }}>
      <Suspense fallback={<FullPageLoader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </div>
);

// ─── Router ───────────────────────────────────────────────────────────────────
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* All routes wrapped in MainLayout (Navbar always visible) */}
        <Route element={<MainLayout />}>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/series/:id" element={<SeriesDetail />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Guest-only routes (redirect authenticated users) */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/lists" element={<CustomLists />} />
            <Route path="/lists/:id" element={<ListDetail />} />
            <Route path="/ratings" element={<MyRatings />} />
            <Route path="/reviews" element={<MyReviews />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ai/recommendations/:mediaType" element={<AiRecommendations />} />
            <Route path="/ai/compare/:mediaType/:mediaId1/:mediaId2" element={<AiComparison />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
