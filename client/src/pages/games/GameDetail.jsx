import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import mediaService from '../../services/mediaService';
import reviewService from '../../services/reviewService';
import GameCard from '../../components/media/GameCard';
import { formatDate } from '../../utils/formatDate';
import { useLibrary } from '../../hooks/useLibrary';
import { getStatusColor } from '../../utils/getStatusColor';
import FavoriteButton from '../../components/media/FavoriteButton';
import ReviewModal from '../../components/media/ReviewModal';
import AddToListModal from '../../components/media/AddToListModal';
import SkeletonDetail from '../../components/common/SkeletonDetail';
import toast from 'react-hot-toast';

const GameDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsError, setReviewsError] = useState(null);
  
  const { getStatus, isInLibrary, addToLibrary, removeFromLibrary } = useLibrary();
  const currentStatus = getStatus('game', id);
  const libraryItem = isInLibrary('game', id);
  const isFavorite = libraryItem ? libraryItem.favorite : false;

  // Modals state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await mediaService.getGameById(id);
        if (!cancelled) setGame(data);
        
        try {
          const revData = await reviewService.getMediaReviews('game', id);
          if (!cancelled) setReviews(revData);
        } catch (revErr) {
          if (!cancelled) setReviewsError('Failed to load reviews');
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load game details');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (location.state?.openReviewModal && !isLoading && !showReviewModal) {
      setShowReviewModal(true);
      // Clear the state so it doesn't reopen on close
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, isLoading, showReviewModal, navigate]);

  const handleSaveReview = async (rating, reviewText) => {
    try {
      if (!currentStatus) {
        await addToLibrary('game', id, 'completed');
      }
      await reviewService.updateReview('game', id, rating ? parseInt(rating) : null, reviewText);
      toast.success('Review saved!');
      setShowReviewModal(false);
      // Refresh reviews
      const revData = await reviewService.getMediaReviews('game', id);
      setReviews(revData);
    } catch (err) {
      toast.error(err.message || 'Failed to save review');
    }
  };

  if (isLoading) {
    return <SkeletonDetail />;
  }

  if (error || !game) {
    return (
      <div className="page-container text-center my-5">
        <h2 className="text-danger">Error</h2>
        <p>{error || 'Game not found'}</p>
      </div>
    );
  }

  const heroBackground = game.screenshots?.[0] || game.poster_url;

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div 
        style={{
          backgroundImage: `linear-gradient(to right, rgba(13, 13, 26, 0.95) 0%, rgba(13, 13, 26, 0.7) 100%), url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: 'var(--spacing-3xl) 0',
          minHeight: '500px',
        }}
      >
        <div className="container d-flex flex-column flex-md-row gap-5 align-items-center align-items-md-start">
          <img 
            src={game.poster_url} 
            alt={game.title} 
            style={{ width: '300px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}
          />
          
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '3rem', marginBottom: 'var(--spacing-xs)' }}>
              {game.title} <span className="text-muted" style={{ fontWeight: 400 }}>({game.release_date?.slice(0, 4)})</span>
            </h1>
            
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3 text-muted">
              <span>{formatDate(game.release_date)}</span>
              {game.platforms && game.platforms.length > 0 && (
                <>
                  <span>•</span>
                  {game.platforms.map(platform => (
                    <span key={platform} className="badge bg-secondary" style={{ backgroundColor: 'var(--color-bg-elevated) !important', color: 'var(--color-text-secondary)', border: '1px solid var(--color-bg-deep)' }}>
                      {platform}
                    </span>
                  ))}
                </>
              )}
            </div>

            <div className="d-flex align-items-center gap-4 mb-4">
              <div className="d-flex align-items-center gap-2">
                <div style={{ 
                  width: '50px', height: '50px', borderRadius: '50%', 
                  backgroundColor: 'var(--color-bg-deep)', border: '3px solid var(--color-accent-teal)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                  {game.vote_average ? game.vote_average.toFixed(1) : 'NR'}
                </div>
                <strong>RAWG<br/>Rating</strong>
              </div>
              
              <div className="d-flex align-items-center gap-3">
                <button 
                  className="btn px-4 py-2"
                  style={{
                    backgroundColor: currentStatus ? `var(--${getStatusColor(currentStatus)})` : 'var(--color-accent-purple)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={async () => {
                    if (currentStatus) {
                      await removeFromLibrary('game', id);
                    } else {
                      await addToLibrary('game', id, 'backlog');
                    }
                  }}
                  onMouseOver={(e) => {
                    if (currentStatus) {
                      e.currentTarget.style.backgroundColor = 'var(--color-danger)';
                      e.currentTarget.innerText = '✕ Remove from Library';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentStatus) {
                      e.currentTarget.style.backgroundColor = `var(--${getStatusColor(currentStatus)})`;
                      e.currentTarget.innerText = `✓ ${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}`;
                    }
                  }}
                >
                  {currentStatus ? `✓ ${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}` : '+ Add to Library'}
                </button>
                <FavoriteButton mediaType="game" mediaId={id} isFavorite={isFavorite} />
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => setShowListModal(true)}
                  title="Add to Custom List"
                >
                  + List
                </button>
              </div>
            </div>

            <div className="mb-4">
              {game.developers?.length > 0 && <div><strong>Developer:</strong> <span className="text-muted">{game.developers.join(', ')}</span></div>}
              {game.publishers?.length > 0 && <div><strong>Publisher:</strong> <span className="text-muted">{game.publishers.join(', ')}</span></div>}
              {game.genres?.length > 0 && <div><strong>Genres:</strong> <span className="text-muted">{game.genres.join(', ')}</span></div>}
            </div>

            <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--spacing-sm)' }}>About</h4>
            <div style={{ lineHeight: 1.8, fontSize: '1.1rem' }} dangerouslySetInnerHTML={{ __html: game.description || 'No description available.' }}></div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-3xl)' }}>
        {/* Screenshots Section */}
        {game.screenshots && game.screenshots.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-4">Screenshots</h3>
            <div className="d-flex gap-3" style={{ overflowX: 'auto', paddingBottom: 'var(--spacing-md)', scrollbarWidth: 'none' }}>
              {game.screenshots.map((screenUrl, i) => (
                <div key={i} style={{ minWidth: '400px', height: '225px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={screenUrl} alt={`Screenshot ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">Reviews</h3>
            <button className="btn btn-primary" onClick={() => setShowReviewModal(true)}>
              Write Review
            </button>
          </div>
          {reviewsError ? (
            <p className="text-danger">{reviewsError}</p>
          ) : reviews.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {reviews.map((r, i) => (
                <div key={i} className="card p-3 bg-surface border-0">
                  <div className="d-flex align-items-center mb-2">
                    <img src={r.avatar_url || '/images/default-avatar.png'} alt={r.username} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} className="me-2" />
                    <div>
                      <div className="fw-bold text-light">{r.username}</div>
                      <div className="text-muted small">{formatDate(r.created_at)}</div>
                    </div>
                    {r.rating && (
                      <div className="ms-auto d-flex align-items-center bg-dark px-2 py-1 rounded">
                        <span className="text-accent-amber me-1">★</span>
                        <span className="fw-bold text-light">{r.rating}</span>
                        <span className="text-light small ms-1">/ 10</span>
                      </div>
                    )}
                  </div>
                  <p className="mb-0 text-light mt-2" style={{ whiteSpace: 'pre-line' }}>{r.review}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No reviews yet. Be the first to review this game!</p>
          )}
        </div>

        {/* Similar Games Section */}
        {game.similar && game.similar.length > 0 && (
          <div>
            <h3 className="mb-4">Similar Games</h3>
            <div className="d-flex gap-3" style={{ overflowX: 'auto', paddingBottom: 'var(--spacing-md)', scrollbarWidth: 'none' }}>
              {game.similar.map(sim => (
                <GameCard key={sim.rawg_id} {...sim} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReviewModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSave={handleSaveReview}
        initialRating={libraryItem?.rating}
        initialReview={libraryItem?.review}
        mediaTitle={game.title}
      />
      <AddToListModal 
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        mediaType="game"
        mediaId={id}
        mediaTitle={game.title}
      />
    </div>
  );
};

export default GameDetail;
