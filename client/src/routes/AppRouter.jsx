import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layout
import Navbar from '../components/layout/Navbar';

// Pages
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import NotFound from '../pages/NotFound';
import Discover from '../pages/Discover';
import MovieDetail from '../pages/movies/MovieDetail';
import SeriesDetail from '../pages/series/SeriesDetail';
import GameDetail from '../pages/games/GameDetail';
import SearchResults from '../pages/SearchResults';

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

// ─── Main Layout (with Navbar) ────────────────────────────────────────────────
const MainLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
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
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/series/:id" element={<SeriesDetail />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/search" element={<SearchResults />} />

          {/* Guest-only routes (redirect authenticated users) */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Phase 3+: more protected routes added here */}
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
