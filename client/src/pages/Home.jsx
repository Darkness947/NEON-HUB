import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page-container fade-in">
      {/* Hero Section */}
      <div className="text-center" style={{ padding: '8vh 0 6vh' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 700,
            marginBottom: 'var(--spacing-md)',
          }}
        >
          <span style={{ color: 'var(--color-accent-purple)' }}>NEON</span>{' '}
          <span style={{ color: 'var(--color-accent-blue)' }}>HUB</span>
        </h1>
        <p
          className="text-muted mx-auto"
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            maxWidth: '600px',
            lineHeight: 1.7,
          }}
        >
          Track your movies, TV series, and video games in one beautiful dashboard.
          Rate, review, and organize everything you watch and play.
        </p>

        <div className="d-flex justify-content-center gap-3 mt-4">
          {isAuthenticated ? (
            <Link className="btn btn-primary px-4 py-2" to="/dashboard">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link className="btn btn-primary px-4 py-2" to="/register">
                Get Started
              </Link>
              <Link className="btn btn-outline-primary px-4 py-2" to="/login">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="row g-4 mt-4" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {[
          {
            icon: '🎬',
            title: 'Movies',
            desc: 'Track films from TMDB — mark as watched, rate, and review.',
          },
          {
            icon: '📺',
            title: 'TV Series',
            desc: 'Follow shows episode by episode with progress tracking.',
          },
          {
            icon: '🎮',
            title: 'Games',
            desc: 'Log your gaming library powered by RAWG — hours played, status, reviews.',
          },
        ].map((feature) => (
          <div className="col-md-4" key={feature.title}>
            <div
              className="card h-100 p-4 text-center"
              style={{
                transition: 'transform var(--transition-base), box-shadow var(--transition-base)',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glow-purple)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>
                {feature.icon}
              </div>
              <h4 style={{ fontFamily: 'var(--font-display)' }}>{feature.title}</h4>
              <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
