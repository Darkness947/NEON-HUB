import { Link } from 'react-router-dom';
import { truncateText } from '../../utils/truncateText';

const GameCard = ({ rawg_id, title, poster_url, release_date, vote_average, platforms, userStatus, isFavorite }) => {
  const year = release_date ? release_date.slice(0, 4) : '—';
  const displayTitle = truncateText(title, 35);
  const rating = vote_average ? vote_average.toFixed(1) : 'NR';

  // In Phase 5, these handlers will actually work
  const handleAddToLibrary = (e) => {
    e.preventDefault();
    console.log(`Add ${title} to library`);
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    console.log(`Toggle favorite for ${title}`);
  };

  return (
    <Link to={`/games/${rawg_id}`} className="media-card">
      {poster_url ? (
        <img src={poster_url} alt={title} className="media-card-poster" loading="lazy" />
      ) : (
        <div className="media-card-fallback">{title}</div>
      )}

      <div className="media-card-rating">
        ★ {rating}
      </div>

      <div 
        className={`media-card-favorite ${isFavorite ? 'active' : ''}`}
        onClick={handleToggleFavorite}
      >
        {isFavorite ? '♥' : '♡'}
      </div>

      <div className="media-card-overlay">
        <div className="media-card-title">{displayTitle}</div>
        <div className="media-card-year">
          {year}
          {platforms && platforms.length > 0 && (
            <span className="ms-2 small text-muted">
               | {platforms.slice(0, 2).join(', ')}
               {platforms.length > 2 && ' +'}
            </span>
          )}
        </div>
        
        <button 
          className="btn btn-primary media-card-btn"
          onClick={handleAddToLibrary}
        >
          {userStatus ? 'In Library' : 'Add to Library'}
        </button>
      </div>
    </Link>
  );
};

export default GameCard;
