import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer 
      style={{
        backgroundColor: 'rgba(13, 13, 26, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--border-neon)',
        padding: '3rem 0 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="container px-3 px-lg-4">
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <Link
              to="/"
              className="d-inline-flex align-items-center gap-2 mb-3"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.5rem',
                letterSpacing: '2px',
                background: 'linear-gradient(135deg, var(--neon-cyan), var(--color-accent-purple))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 8px rgba(0, 245, 255, 0.3))',
                textDecoration: 'none',
              }}
            >
              NEON HUB
            </Link>
            <p className="text-muted" style={{ fontSize: '0.95rem', maxWidth: '300px' }}>
              Your ultimate digital media library. Track movies, series, and games in one beautifully crafted space.
            </p>
          </div>
          
          <div className="col-6 col-md-2 offset-md-2">
            <h5 className="font-ui mb-3" style={{ color: 'var(--color-text-primary)' }}>Explore</h5>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
              <li><Link to="/discover?tab=movies" className="text-muted text-decoration-none">Movies</Link></li>
              <li><Link to="/discover?tab=series" className="text-muted text-decoration-none">TV Series</Link></li>
              <li><Link to="/discover?tab=games" className="text-muted text-decoration-none">Games</Link></li>
            </ul>
          </div>
          
          <div className="col-6 col-md-2">
            <h5 className="font-ui mb-3" style={{ color: 'var(--color-text-primary)' }}>Account</h5>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="/dashboard" className="text-muted text-decoration-none">Dashboard</Link></li>
              <li><Link to="/library" className="text-muted text-decoration-none">My Library</Link></li>
              <li><Link to="/favorites" className="text-muted text-decoration-none">Favorites</Link></li>
              <li><Link to="/lists" className="text-muted text-decoration-none">Custom Lists</Link></li>
            </ul>
          </div>
          
          <div className="col-12 col-md-2">
            <h5 className="font-ui mb-3" style={{ color: 'var(--color-text-primary)' }}>Legal</h5>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><a href="#" className="text-muted text-decoration-none">Privacy Policy</a></li>
              <li><a href="#" className="text-muted text-decoration-none">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div 
          className="pt-3 d-flex flex-column flex-md-row justify-content-between align-items-center" 
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
        >
          <p className="text-muted mb-2 mb-md-0" style={{ fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} Neon Hub. All rights reserved.
          </p>
          <div className="d-flex gap-3">
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>Powered by TMDB & RAWG</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
