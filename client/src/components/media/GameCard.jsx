import { useState } from 'react';
import { Link } from 'react-router-dom';
import { truncateText } from '../../utils/truncateText';
import { useLibrary } from '../../hooks/useLibrary';
import StatusDropdown from './StatusDropdown';
import { getStatusColor } from '../../utils/getStatusColor';

const GameCard = ({ rawg_id, title, poster_url, release_date, vote_average, platforms, showDropdown = false, selectable = false, selected = false, onSelect }) => {
  const { isInLibrary, addToLibrary, removeFromLibrary, toggleFavorite } = useLibrary();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const year = release_date ? release_date.slice(0, 4) : '—';
  const displayTitle = truncateText(title, 35);
  const rating = vote_average ? vote_average.toFixed(1) : 'NR';

  const libraryItem = isInLibrary('game', rawg_id);
  const userStatus = libraryItem ? libraryItem.status : null;
  const isFavorite = libraryItem ? libraryItem.favorite : false;

  const handleAddToLibrary = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!libraryItem) {
      try {
        await addToLibrary('game', rawg_id);
      } catch (err) {
        console.error('Failed to add to library', err);
      }
    }
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (libraryItem) {
      await toggleFavorite('game', rawg_id);
    } else {
      await addToLibrary('game', rawg_id, 'planned');
      setTimeout(() => toggleFavorite('game', rawg_id), 300);
    }
  };

  const handleClick = (e) => {
    if (selectable) {
      e.preventDefault();
      e.stopPropagation();
      if (onSelect) onSelect(rawg_id);
    }
  };

  return (
    <Link to={`/games/${rawg_id}`} className={`media-card ${isDropdownOpen ? 'has-open-dropdown' : ''} ${selected ? 'selected-card' : ''}`} onClick={handleClick}>
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
        <div className="media-card-year mb-3 text-muted" style={{ fontSize: '0.85rem' }}>
          {year}
          {platforms && platforms.length > 0 && (
            <span className="ms-2 small text-muted">
               | {platforms.slice(0, 2).join(', ')}
               {platforms.length > 2 && ' +'}
            </span>
          )}
        </div>
        
        {showDropdown ? (
          <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <StatusDropdown 
              mediaType="game" 
              mediaId={rawg_id} 
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
                await removeFromLibrary('game', rawg_id);
              } else {
                await addToLibrary('game', rawg_id, 'backlog');
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

export default GameCard;
