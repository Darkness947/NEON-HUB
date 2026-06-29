import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark sticky-top"
      style={{
        backgroundColor: 'rgba(13, 13, 26, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        zIndex: 1050,
      }}
    >
      <div className="container-fluid px-3 px-lg-4">
        {/* Brand */}
        <Link
          className="navbar-brand d-flex align-items-center gap-2"
          to="/"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem' }}
        >
          <span style={{ color: 'var(--color-accent-purple)' }}>NEON</span>
          <span style={{ color: 'var(--color-accent-blue)' }}>HUB</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Content */}
        <div className={`collapse navbar-collapse ${isNavCollapsed ? '' : 'show'}`}>
          {/* Search Bar (center) */}
          <form
            className="d-flex mx-auto my-2 my-lg-0"
            style={{ maxWidth: '400px', width: '100%' }}
            onSubmit={handleSearch}
          >
            <div className="input-group">
              <input
                type="search"
                className="form-control"
                placeholder="Search movies, series, games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--color-text-primary)',
                  borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                }}
              />
              <button
                className="btn btn-outline-primary"
                type="submit"
                style={{
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                🔍
              </button>
            </div>
          </form>

          {/* Nav Links */}
          <ul className="navbar-nav ms-auto align-items-center gap-1">
            <li className="nav-item">
              <Link className="nav-link" to="/" style={{ color: 'var(--color-text-muted)' }}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/discover" style={{ color: 'var(--color-text-muted)' }}>
                Discover
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard" style={{ color: 'var(--color-text-muted)' }}>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/library" style={{ color: 'var(--color-text-muted)' }}>
                    Library
                  </Link>
                </li>

                {/* User Dropdown */}
                <li className="nav-item dropdown ms-2" style={{ position: 'relative' }}>
                  <button
                    className="btn btn-link nav-link d-flex align-items-center gap-2 p-0"
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-accent-purple)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#fff',
                        border: '2px solid var(--color-accent-blue)',
                      }}
                    >
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span
                      className="d-none d-lg-inline"
                      style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem' }}
                    >
                      {user?.username}
                    </span>
                  </button>

                  {showDropdown && (
                    <div
                      className="dropdown-menu show"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        marginTop: '8px',
                        minWidth: '180px',
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                      }}
                    >
                      <Link
                        className="dropdown-item py-2"
                        to="/profile"
                        onClick={() => setShowDropdown(false)}
                      >
                        👤 Profile
                      </Link>
                      <Link
                        className="dropdown-item py-2"
                        to="/favorites"
                        onClick={() => setShowDropdown(false)}
                      >
                        ❤️ Favorites
                      </Link>
                      <Link
                        className="dropdown-item py-2"
                        to="/reviews"
                        onClick={() => setShowDropdown(false)}
                      >
                        ✍️ My Reviews
                      </Link>
                      <Link
                        className="dropdown-item py-2"
                        to="/lists"
                        onClick={() => setShowDropdown(false)}
                      >
                        📋 Custom Lists
                      </Link>
                      <Link
                        className="dropdown-item py-2"
                        to="/settings"
                        onClick={() => setShowDropdown(false)}
                      >
                        ⚙️ Settings
                      </Link>
                      <hr className="dropdown-divider" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                      <button
                        className="dropdown-item py-2"
                        onClick={handleLogout}
                        style={{ color: 'var(--color-danger)' }}
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <>
                <li className="nav-item ms-2">
                  <Link className="btn btn-outline-primary btn-sm" to="/login">
                    Log In
                  </Link>
                </li>
                <li className="nav-item ms-1">
                  <Link className="btn btn-primary btn-sm" to="/register">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
