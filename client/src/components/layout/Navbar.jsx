import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import defaultAvatar from '../../assets/images/default_avatar.png';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-neon)',
        zIndex: 1050,
      }}
    >
      <div className="container-fluid px-3 px-lg-4">
        {/* Brand — neon gradient text */}
        <Link
          className="navbar-brand d-flex align-items-center gap-1"
          to="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.5rem',
            letterSpacing: '2px',
            background: 'linear-gradient(135deg, var(--neon-cyan), var(--color-accent-purple))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 8px rgba(0, 245, 255, 0.4))',
            textDecoration: 'none',
            transition: 'filter 0.3s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(0, 245, 255, 0.7))'; }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(0, 245, 255, 0.4))'; }}
        >
          NEON HUB
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          aria-label="Toggle navigation"
          style={{ borderColor: 'var(--neon-cyan)' }}
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
                placeholder={t('home.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search media"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--border-neon)',
                  color: 'var(--color-text-primary)',
                  borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                }}
              />
              <button
                className="btn btn-outline-primary"
                type="submit"
                aria-label="Submit search"
                style={{
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                  borderColor: 'var(--border-neon)',
                }}
              >
                🔍
              </button>
            </div>
          </form>

          {/* Nav Links */}
          <ul className="navbar-nav ms-auto align-items-center gap-1">
            <li className="nav-item">
              <Link className="nav-link" to="/" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.5px', transition: 'color 0.3s ease' }}>
                {t('nav.home')}
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/discover" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.5px', transition: 'color 0.3s ease' }}>
                {t('nav.discover')}
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.5px' }}>
                    {t('nav.dashboard')}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/library" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.5px' }}>
                    {t('nav.library')}
                  </Link>
                </li>

                {/* User Dropdown */}
                <li className="nav-item dropdown ms-2" style={{ position: 'relative' }}>
                  <button
                    className="btn btn-link nav-link d-flex align-items-center gap-2 p-0"
                    onClick={() => setShowDropdown(!showDropdown)}
                    aria-label="User menu"
                    aria-expanded={showDropdown}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid var(--neon-cyan)',
                        boxShadow: '0 0 8px rgba(0, 245, 255, 0.3)',
                        transition: 'box-shadow 0.3s ease',
                      }}
                    >
                      <img 
                        src={user?.avatar_url || defaultAvatar} 
                        alt="Avatar" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                      />
                    </div>
                    <span
                      className="d-none d-lg-inline"
                      style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem', fontFamily: 'var(--font-ui)', fontWeight: 600 }}
                    >
                      {user?.username}
                    </span>
                  </button>

                  {showDropdown && (
                    <div
                      className="dropdown-menu show"
                      style={{
                        position: 'absolute',
                        right: document.documentElement.dir === 'rtl' ? 'auto' : 0,
                        left: document.documentElement.dir === 'rtl' ? 0 : 'auto',
                        top: '100%',
                        marginTop: '8px',
                        minWidth: '180px',
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--border-neon)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 245, 255, 0.1)',
                      }}
                    >
                      <Link className="dropdown-item py-2" to="/profile" onClick={() => setShowDropdown(false)}>
                        👤 {t('nav.profile')}
                      </Link>
                      <Link className="dropdown-item py-2" to="/favorites" onClick={() => setShowDropdown(false)}>
                        ❤️ {t('favorites.title')}
                      </Link>
                      <Link className="dropdown-item py-2" to="/ratings" onClick={() => setShowDropdown(false)}>
                        ⭐ {t('media.rating')}
                      </Link>
                      <Link className="dropdown-item py-2" to="/reviews" onClick={() => setShowDropdown(false)}>
                        ✍️ {t('reviews.title')}
                      </Link>
                      <Link className="dropdown-item py-2" to="/lists" onClick={() => setShowDropdown(false)}>
                        📋 {t('lists.title')}
                      </Link>
                      <Link className="dropdown-item py-2" to="/settings" onClick={() => setShowDropdown(false)}>
                        ⚙️ {t('nav.settings')}
                      </Link>
                      <hr className="dropdown-divider" style={{ borderColor: 'var(--border-neon)' }} />
                      <button
                        className="dropdown-item py-2"
                        onClick={handleLogout}
                        style={{ color: 'var(--color-danger)' }}
                      >
                        🚪 {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <>
                <li className="nav-item ms-2">
                  <Link className="btn btn-outline-primary btn-sm" to="/login">
                    {t('nav.login')}
                  </Link>
                </li>
                <li className="nav-item ms-1">
                  <Link className="btn btn-primary btn-sm" to="/register">
                    {t('nav.register')}
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
