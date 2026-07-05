import { Link } from 'react-router-dom';

const EmptyState = ({ icon = '📭', title, message, actionText, actionLink, onAction }) => {
  return (
    <div 
      className="text-center py-5 px-4 animate-fade-up"
      style={{ 
        backgroundColor: 'var(--color-bg-surface)', 
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div style={{ fontSize: '3.5rem', marginBottom: '1.2rem', opacity: 0.6, filter: 'grayscale(0.3)' }}>
        {icon}
      </div>
      <h3 className="mb-2" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
        {title}
      </h3>
      <p className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto 1.5rem', lineHeight: 1.7 }}>
        {message}
      </p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary px-4 py-2" style={{ borderRadius: '20px', fontWeight: 600 }}>
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionLink && (
        <button className="btn btn-primary px-4 py-2" onClick={onAction} style={{ borderRadius: '20px', fontWeight: 600 }}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
