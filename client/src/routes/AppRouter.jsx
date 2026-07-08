import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layout
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Pages
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Dashboard from '../pages/dashboard/Dashboard';
import NotFound from '../pages/NotFound';
import Discover from '../pages/Discover';
import MovieDetail from '../pages/movies/MovieDetail';
import SeriesDetail from '../pages/series/SeriesDetail';
import GameDetail from '../pages/games/GameDetail';
import SearchResults from '../pages/SearchResults';
import Library from '../pages/library/Library';
import Favorites from '../pages/favorites/Favorites';
import CustomLists from '../pages/lists/CustomLists';
import ListDetail from '../pages/lists/ListDetail';
import MyReviews from '../pages/reviews/MyReviews';
import Profile from '../pages/profile/Profile';
import Settings from '../pages/profile/Settings';
import MyRatings from '../pages/profile/MyRatings';
import Contact from '../pages/Contact';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';

// ─── Protected Route Wrapper ──────────────────────────────────────────────────
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// ─── Guest Only Route (redirect to dashboard if already logged in) ────────────
const GuestRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

// ─── Main Layout (with Navbar and Footer) ─────────────────────────────────────
const MainLayout = () => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <main style={{ flex: 1 }}>
      <Outlet />
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
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
