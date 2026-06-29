const FullPageLoader = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-deep)',
      }}
    >
      <div className="text-center">
        <div
          className="spinner-border"
          role="status"
          style={{
            width: '3rem',
            height: '3rem',
            color: 'var(--color-accent-purple)',
            borderWidth: '3px',
          }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p
          className="mt-3 text-muted"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Loading Neon Hub...
        </p>
      </div>
    </div>
  );
};

export default FullPageLoader;
