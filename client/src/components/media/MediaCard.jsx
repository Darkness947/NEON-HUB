import { useState } from 'react';
import { Link } from 'react-router-dom';
import { truncateText } from '../../utils/truncateText';
import { useLibrary } from '../../hooks/useLibrary';
import StatusDropdown from './StatusDropdown';
import { getStatusColor } from '../../utils/getStatusColor';

const MediaCard = ({ id, tmdb_id, rawg_id, title, poster_url, release_date, vote_average, media_type, showDropdown = false, selectable = false, selected = false, onSelect }) => {
  const { isInLibrary, addToLibrary, removeFromLibrary, toggleFavorite } = useLibrary();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const finalId = id || tmdb_id || rawg_id;
  const year = release_date ? release_date.slice(0, 4) : '—';
  const displayTitle = truncateText(title, 35);
  const rating = vote_average ? vote_average.toFixed(1) : 'NR';

  const libraryItem = isInLibrary(media_type, finalId);
  const userStatus = libraryItem ? libraryItem.status : null;
  const isFavorite = libraryItem ? libraryItem.favorite : false;

  const handleAddToLibrary = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!libraryItem) {
      try {
        await addToLibrary(media_type, finalId);
      } catch (err) {
        console.error('Failed to add to library', err);
      }
    }
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (libraryItem) {
      await toggleFavorite(media_type, finalId);
    } else {
      await addToLibrary(media_type, finalId, 'planned');
      setTimeout(() => toggleFavorite(media_type, finalId), 300);
    }
  };

  const linkTo = media_type === 'game' ? `/games/${finalId}` : media_type === 'movie' ? `/movies/${finalId}` : `/series/${finalId}`;

  const handleClick = (e) => {
    if (selectable) {
      e.preventDefault();
      e.stopPropagation();
      if (onSelect) onSelect(finalId);
    }
  };

  return (
    <Link to={linkTo} className={`media-card ${isDropdownOpen ? 'has-open-dropdown' : ''} ${selected ? 'selected-card' : ''}`} onClick={handleClick}>
      {selectable && (
        <div 
          className="position-absolute d-flex align-items-center justify-content-center"
          style={{
            top: '10px',
            left: '10px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: selected ? 'var(--color-accent-purple)' : 'rgba(0,0,0,0.5)',
            border: `2px solid ${selected ? 'var(--color-accent-purple)' : 'rgba(255,255,255,0.7)'}`,
            zIndex: 11,
            transition: 'all 0.2s',
            color: '#fff',
            fontSize: '14px'
          }}
        >
          {selected && '✓'}
        </div>
      )}
      
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
        style={{ cursor: 'pointer', zIndex: 10, position: 'absolute', top: '10px', right: '10px', fontSize: '1.5rem', color: isFavorite ? '#e53e3e' : 'rgba(255,255,255,0.7)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
      >
        {isFavorite ? '♥' : '♡'}
      </div>

      <div className="media-card-overlay d-flex flex-column justify-content-end p-3">
        <div className="media-card-title mb-1" style={{ fontWeight: 600 }}>{displayTitle}</div>
        <div className="media-card-year mb-3 text-muted" style={{ fontSize: '0.85rem' }}>{year}</div>
        
        {showDropdown ? (
          <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <StatusDropdown 
              mediaType={media_type} 
              mediaId={finalId} 
              currentStatus={userStatus} 
              onDropdownToggle={setIsDropdownOpen}
            />
          </div>
        ) : (
          <button 
            className="btn btn-sm w-100"
            style={{
              backgroundColor: userStatus ? `var(--${getStatusColor(userStatus)})` : 'rgba(123, 47, 190, 0.15)',
              color: '#fff',
              border: userStatus ? 'none' : '1px solid rgba(123, 47, 190, 0.4)',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '500',
              padding: '6px 12px',
              transition: 'all 0.2s ease',
            }}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (userStatus) {
                await removeFromLibrary(media_type, finalId);
              } else {
                await addToLibrary(media_type, finalId, 'planned');
              }
            }}
            onMouseOver={(e) => {
              if (!userStatus) {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-purple)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glow-purple)';
              } else {
                e.currentTarget.style.backgroundColor = 'var(--color-danger)';
                e.currentTarget.innerText = '✕ Remove';
              }
            }}
            onMouseOut={(e) => {
              if (!userStatus) {
                e.currentTarget.style.backgroundColor = 'rgba(123, 47, 190, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              } else {
                e.currentTarget.style.backgroundColor = `var(--${getStatusColor(userStatus)})`;
                e.currentTarget.innerText = `✓ ${userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}`;
              }
            }}
          >
            {userStatus ? `✓ ${userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}` : '+ Add to Library'}
          </button>
        )}
      </div>
    </Link>
  );
};

export default MediaCard;
