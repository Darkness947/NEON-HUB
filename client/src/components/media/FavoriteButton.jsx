import { useState } from 'react';
import { useLibrary } from '../../hooks/useLibrary';

const FavoriteButton = ({ mediaType, mediaId, isFavorite }) => {
  const { toggleFavorite, isLoading, isInLibrary, addToLibrary } = useLibrary();
  const [isUpdating, setIsUpdating] = useState(false);

  // If not in library, favoriting is disabled or we can just hide it
  const inLibrary = isInLibrary(mediaType, mediaId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsUpdating(true);
    try {
      if (!inLibrary) {
        await addToLibrary(mediaType, mediaId, 'planned');
        setTimeout(() => toggleFavorite(mediaType, mediaId), 300);
      } else {
        await toggleFavorite(mediaType, mediaId);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const heartStyle = {
    color: isFavorite ? 'var(--accent-amber)' : 'rgba(255, 255, 255, 0.5)',
    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    transform: isUpdating ? 'scale(0.8)' : (isFavorite ? 'scale(1.1)' : 'scale(1)'),
    cursor: isLoading ? 'default' : 'pointer',
    fontSize: '1.5rem',
    background: 'none',
    border: 'none',
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <button 
      onClick={handleClick} 
      disabled={isLoading || isUpdating} 
      style={heartStyle} 
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className="favorite-btn"
    >
      {isFavorite ? '♥' : '♡'}
    </button>
  );
};

export default FavoriteButton;
