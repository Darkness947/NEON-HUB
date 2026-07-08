import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import { getStatusColor } from '../../utils/getStatusColor';

const ReviewCard = ({ review, onDelete }) => {
  const getMediaLink = () => {
    switch(review.media_type) {
      case 'movie': return `/movies/${review.media_id}`;
      case 'series': return `/series/${review.media_id}`;
      case 'game': return `/games/${review.media_id}`;
      default: return '#';
    }
  };

  const statusColor = review.status ? getStatusColor(review.status) : 'secondary';

  return (
    <div className="card p-3 mb-4 fade-in" style={{ backgroundColor: 'var(--color-bg-elevated)', border: 'none' }}>
      <div className="d-flex flex-column flex-md-row">
        {/* Poster */}
        {review.poster_url || review.poster_path ? (
          <Link to={getMediaLink()} className="flex-shrink-0 mb-3 mb-md-0 me-md-4">
            <img 
              src={review.poster_url || review.poster_path} 
              alt={review.title || review.name} 
              style={{ width: '100px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
            />
          </Link>
        ) : (
          <div 
            className="flex-shrink-0 mb-3 mb-md-0 me-md-4 d-flex justify-content-center align-items-center"
            style={{ width: '100px', height: '150px', backgroundColor: 'var(--color-bg-surface)', borderRadius: '8px' }}
          >
            <span className="text-muted small text-center px-2">No Image</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <Link to={getMediaLink()} className="text-decoration-none">
                <h4 className="text-light mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  {review.title || review.name}
                </h4>
              </Link>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className={`badge bg-${statusColor}`} style={{ textTransform: 'capitalize' }}>
                  {review.status}
                </span>
                <span className="text-muted small">{formatDate(review.created_at)}</span>
              </div>
            </div>
            
            {/* Rating */}
            {review.rating && (
              <div className="d-flex align-items-center bg-dark px-2 py-1 rounded">
                <span className="text-accent-amber me-1">★</span>
                <span className="fw-bold text-light">{review.rating}</span>
                <span className="text-light small ms-1">/ 10</span>
              </div>
            )}
          </div>

          {review.review && (
            <div className="mt-3">
              <p className="text-light" style={{ whiteSpace: 'pre-line', lineHeight: '1.6', margin: 0 }}>
                {review.review}
              </p>
            </div>
          )}
          
          <div className="d-flex justify-content-end mt-3">
            <Link to={getMediaLink()} state={{ openReviewModal: true }} className="btn btn-sm btn-outline-secondary me-2">
              Edit Review
            </Link>
            {onDelete && (
              <button 
                className="btn btn-sm btn-outline-danger" 
                onClick={() => onDelete(review.media_type, review.media_id)}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
