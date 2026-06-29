import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="page-container fade-in">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 'var(--spacing-lg)' }}>
        Welcome back, <span className="text-accent-purple">{user?.username}</span>
      </h1>

      <div className="row g-4">
        {[
          { label: 'Movies', count: 0, icon: '🎬', color: 'var(--color-accent-purple)' },
          { label: 'Series', count: 0, icon: '📺', color: 'var(--color-accent-blue)' },
          { label: 'Games', count: 0, icon: '🎮', color: 'var(--color-accent-amber)' },
          { label: 'Reviews', count: 0, icon: '✍️', color: 'var(--color-success)' },
        ].map((stat) => (
          <div className="col-6 col-md-3" key={stat.label}>
            <div
              className="card p-3 text-center h-100"
              style={{
                borderLeft: `3px solid ${stat.color}`,
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{stat.icon}</div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: stat.color,
                }}
              >
                {stat.count}
              </div>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 mt-4">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
          Recent Activity
        </h3>
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
          No activity yet. Start tracking movies, series, and games to see your activity here.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
