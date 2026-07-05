const SkeletonDetail = () => {
  return (
    <div className="fade-in">
      {/* Hero skeleton */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          minHeight: '500px',
          padding: 'var(--spacing-3xl) 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container d-flex flex-column flex-md-row gap-5 align-items-center align-items-md-start">
          {/* Poster skeleton */}
          <div
            className="skeleton-shimmer"
            style={{
              width: '300px',
              height: '450px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-elevated)',
              flexShrink: 0,
            }}
          />

          {/* Info skeleton */}
          <div style={{ flex: 1, width: '100%' }}>
            <div
              className="skeleton-shimmer mb-3"
              style={{ height: '48px', width: '70%', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)' }}
            />
            <div
              className="skeleton-shimmer mb-3"
              style={{ height: '20px', width: '50%', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)' }}
            />
            <div className="d-flex gap-3 mb-4">
              <div
                className="skeleton-shimmer"
                style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--color-bg-elevated)' }}
              />
              <div
                className="skeleton-shimmer"
                style={{ width: '160px', height: '40px', borderRadius: '20px', backgroundColor: 'var(--color-bg-elevated)' }}
              />
            </div>
            <div
              className="skeleton-shimmer mb-2"
              style={{ height: '16px', width: '90%', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)' }}
            />
            <div
              className="skeleton-shimmer mb-2"
              style={{ height: '16px', width: '80%', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)' }}
            />
            <div
              className="skeleton-shimmer"
              style={{ height: '16px', width: '60%', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        </div>
      </div>

      {/* Cast skeleton */}
      <div className="container" style={{ marginTop: 'var(--spacing-2xl)' }}>
        <div
          className="skeleton-shimmer mb-4"
          style={{ height: '28px', width: '200px', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)' }}
        />
        <div className="d-flex gap-3" style={{ overflowX: 'hidden' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-shimmer"
              style={{
                minWidth: '140px',
                height: '230px',
                backgroundColor: 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonDetail;
