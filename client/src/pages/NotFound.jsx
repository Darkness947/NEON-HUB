import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      className="d-flex justify-content-center align-items-center text-center fade-in"
      style={{ minHeight: 'calc(100vh - 70px)', padding: 'var(--spacing-lg)' }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '6rem',
            fontWeight: 700,
            color: 'var(--color-accent-purple)',
            lineHeight: 1,
          }}
        >
          404
        </h1>
        <h2
          className="mb-3"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          Page Not Found
        </h2>
        <p className="text-muted mb-4">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link className="btn btn-primary px-4" to="/">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
