import { useState, useEffect } from 'react';
import libraryService from '../../services/libraryService';
import { useLibrary } from '../../hooks/useLibrary';
import { toast } from 'react-hot-toast';

const InlineRating = ({ mediaType, mediaId, initialRating, onRatingChange, seasonNumber, episodeNumber }) => {
  const [rating, setRating] = useState(initialRating || null);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updateItem } = useLibrary();

  useEffect(() => {
    setRating(initialRating || null);
  }, [initialRating]);

  const handleRate = async (newRating) => {
    try {
      setIsSubmitting(true);
      if (mediaType === 'episode') {
        await libraryService.updateEpisode(mediaId, seasonNumber, episodeNumber, { rating: newRating });
      } else {
        await updateItem(mediaType, mediaId, { rating: newRating });
      }
      setRating(newRating);
      if (onRatingChange) onRatingChange(newRating);
      toast.success('Rating updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = async () => {
    try {
      setIsSubmitting(true);
      if (mediaType === 'episode') {
        await libraryService.updateEpisode(mediaId, seasonNumber, episodeNumber, { rating: null });
      } else {
        await updateItem(mediaType, mediaId, { rating: null });
      }
      setRating(null);
      if (onRatingChange) onRatingChange(null);
      toast.success('Rating cleared');
    } catch (error) {
      toast.error(error.message || 'Failed to clear rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <div 
        style={{ 
          display: 'flex', 
          gap: '4px',
          opacity: isSubmitting ? 0.5 : 1,
          pointerEvents: isSubmitting ? 'none' : 'auto'
        }}
        onMouseLeave={() => setHoverRating(0)}
      >
        {[...Array(10)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= (hoverRating || rating || 0);
          return (
            <button
              key={starValue}
              className="btn btn-link p-0"
              style={{
                color: isFilled ? 'var(--color-warning)' : 'var(--color-text-muted)',
                textDecoration: 'none',
                transition: 'color 0.2s',
                fontSize: '1.2rem',
                lineHeight: 1
              }}
              onMouseEnter={() => setHoverRating(starValue)}
              onClick={() => handleRate(starValue)}
              aria-label={`Rate ${starValue} stars`}
            >
              {isFilled ? '★' : '☆'}
            </button>
          );
        })}
      </div>
      {rating && (
        <button 
          className="btn btn-link btn-sm p-0 ms-2 text-muted" 
          onClick={handleClear}
          style={{ textDecoration: 'none', fontSize: '0.8rem' }}
          disabled={isSubmitting}
        >
          Clear
        </button>
      )}
      <div className="ms-2" style={{ fontWeight: 'bold', minWidth: '30px' }}>
        {rating ? `${rating}/10` : '—/10'}
      </div>
    </div>
  );
};

export default InlineRating;
