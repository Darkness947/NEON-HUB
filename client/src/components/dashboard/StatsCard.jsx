import React from 'react';

const StatsCard = ({ label, count, icon, color }) => {
  return (
    <div className="col-6 col-md-3">
      <div
        className="card p-3 text-center h-100 fade-in"
        style={{
          borderLeft: `3px solid ${color}`,
          background: 'var(--color-bg-surface)'
        }}
      >
        <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{icon}</div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            fontWeight: 700,
            color: color,
          }}
        >
          {count}
        </div>
        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
          {label}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
