import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import mediaService from '../../services/mediaService';
import reviewService from '../../services/reviewService';
import MediaCard from '../../components/media/MediaCard';
import { formatDate } from '../../utils/formatDate';
import { useLibrary } from '../../hooks/useLibrary';
import { getStatusColor } from '../../utils/getStatusColor';
import FavoriteButton from '../../components/media/FavoriteButton';
import ReviewModal from '../../components/media/ReviewModal';
import AddToListModal from '../../components/media/AddToListModal';
import SkeletonDetail from '../../components/common/SkeletonDetail';
import ScrollableRow from '../../components/common/ScrollableRow';
import InlineRating from '../../components/media/InlineRating';
import EpisodeGuide from '../../components/media/EpisodeGuide';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import libraryService from '../../services/libraryService';
import { useAuth } from '../../hooks/useAuth';

const SeriesDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [series, setSeries] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userEpisodes, setUserEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsError, setReviewsError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { getStatus, isInLibrary, addToLibrary, removeFromLibrary } = useLibrary();
  const currentStatus = getStatus('series', id);
  const libraryItem = isInLibrary('series', id);
  const isFavorite = libraryItem ? libraryItem.favorite : false;

  // Modals state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await mediaService.getSeriesById(id);
        if (!cancelled) setSeries(data);
        
        try {
          const revData = await reviewService.getMediaReviews('series', id);
          if (!cancelled) setReviews(revData);
        } catch (revErr) {
          if (!cancelled) setReviewsError('Failed to load reviews');
        }

        if (isAuthenticated) {
          try {
            const episodesData = await libraryService.getSeriesEpisodes(id);
            if (!cancelled) setUserEpisodes(episodesData);
          } catch (libErr) {
            console.error('Failed to load user episodes', libErr);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load series details');
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
        await addToLibrary('series', id, 'completed');
      }
      await reviewService.updateReview('series', id, rating ? parseInt(rating) : null, reviewText);
      toast.success('Review saved!');
      setShowReviewModal(false);
      // Refresh reviews
      const revData = await reviewService.getMediaReviews('series', id);
      setReviews(revData);
    } catch (err) {
      toast.error(err.message || 'Failed to save review');
    }
  };

  if (isLoading) {
    return <SkeletonDetail />;
  }

  if (error || !series) {
    return (
      <div className="page-container text-center my-5">
        <h2 className="text-danger">Error</h2>
        <p>{error || 'Series not found'}</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <Helmet>
        <title>{series.title} - NEON HUB</title>
        <meta name="description" content={series.overview?.substring(0, 150)} />
        <meta property="og:title" content={`${series.title} - NEON HUB`} />
        <meta property="og:description" content={series.overview?.substring(0, 150)} />
        <meta property="og:image" content={series.poster_url} />
      </Helmet>
      {/* Hero Section */}
      <div 
        style={{
          backgroundImage: `linear-gradient(to right, rgba(13, 13, 26, 0.95) 0%, rgba(13, 13, 26, 0.7) 100%), url(${series.backdrop_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: 'var(--spacing-3xl) 0',
          minHeight: '500px',
        }}
      >
        <div className="container d-flex flex-column flex-md-row gap-5 align-items-center align-items-md-start">
          <img 
            src={series.poster_url} 
            alt={series.title} 
            style={{ width: '300px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}
          />
          
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '3rem', marginBottom: 'var(--spacing-xs)' }}>
              {series.title} <span className="text-muted" style={{ fontWeight: 400 }}>({series.release_date?.slice(0, 4)})</span>
            </h1>
            
            <div className="d-flex align-items-center gap-3 mb-3 text-muted">
              <span>{formatDate(series.release_date)}</span>
              <span>•</span>
              <span>{series.genres?.map(g => g.name).join(', ')}</span>
              <span>•</span>
              <span>{series.number_of_seasons} Seasons</span>
              <span>•</span>
              <span>Status: {series.status}</span>
            </div>

            <div className="d-flex align-items-center gap-4 mb-4">
              <div className="d-flex align-items-center gap-2">
                <div style={{ 
                  width: '50px', height: '50px', borderRadius: '50%', 
                  backgroundColor: 'var(--color-bg-deep)', border: '3px solid var(--color-success)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                  {Math.round(series.vote_average * 10)}%
                </div>
                <strong>User<br/>Score</strong>
              </div>
              
              <div className="d-flex flex-column align-items-start gap-3">
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
                        await removeFromLibrary('series', id);
                      } else {
                        await addToLibrary('series', id, 'planned');
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
                  <FavoriteButton mediaType="series" mediaId={id} isFavorite={isFavorite} />
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setShowListModal(true)}
                    title="Add to Custom List"
                  >
                    + List
                  </button>
                </div>
                {currentStatus && (
                  <div className="bg-dark p-2 rounded" style={{ border: '1px solid var(--border-neon)' }}>
                    <InlineRating 
                      mediaType="series" 
                      mediaId={id} 
                      initialRating={libraryItem?.rating}
                      onRatingChange={(newRating) => {
                        // Optimistically update status if necessary
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <h5 className="text-muted" style={{ fontStyle: 'italic', marginBottom: 'var(--spacing-md)' }}>
              {series.tagline}
            </h5>

            <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--spacing-sm)' }}>Overview</h4>
            <p style={{ lineHeight: 1.8, fontSize: '1.1rem' }}>{series.overview}</p>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-3xl)' }}>
        
        {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-4" style={{ borderBottomColor: 'var(--border-neon)' }}>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              style={{
                backgroundColor: activeTab === 'overview' ? 'var(--color-bg-surface)' : 'transparent',
                color: activeTab === 'overview' ? 'var(--neon-cyan)' : 'var(--color-text-muted)',
                borderColor: activeTab === 'overview' ? 'var(--border-neon) var(--border-neon) var(--color-bg-base)' : 'transparent',
                fontWeight: 600,
              }}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'episodes' ? 'active' : ''}`}
              style={{
                backgroundColor: activeTab === 'episodes' ? 'var(--color-bg-surface)' : 'transparent',
                color: activeTab === 'episodes' ? 'var(--neon-cyan)' : 'var(--color-text-muted)',
                borderColor: activeTab === 'episodes' ? 'var(--border-neon) var(--border-neon) var(--color-bg-base)' : 'transparent',
                fontWeight: 600,
              }}
              onClick={() => setActiveTab('episodes')}
            >
              Episode Guide
            </button>
          </li>
        </ul>

        {activeTab === 'episodes' && (
          <EpisodeGuide 
            seriesId={id} 
            seasons={series.seasons} 
            userEpisodes={userEpisodes} 
          />
        )}

        {activeTab === 'overview' && (
          <>
            {/* Seasons Section */}
            {series.seasons && series.seasons.length > 0 && (
              <div className="mb-5">
                <h3 className="mb-4">Seasons</h3>
                <div className="d-flex flex-column gap-3">
                  {series.seasons.filter(s => s.season_number > 0).map(season => (
                    <div key={season.id} className="card p-3 d-flex flex-row gap-4 align-items-center" style={{ backgroundColor: 'var(--color-bg-surface)', border: 'none', borderRadius: 'var(--radius-md)' }}>
                      {season.poster_url ? (
                        <img src={season.poster_url} alt={season.name} style={{ width: '80px', borderRadius: 'var(--radius-sm)' }} />
                      ) : (
                        <div style={{ width: '80px', height: '120px', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)' }}></div>
                      )}
                      <div>
                        <h4 style={{ marginBottom: '4px' }}>{season.name}</h4>
                        <p className="text-muted mb-0">
                          {formatDate(season.air_date)} • {season.episode_count} Episodes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Cast Section */}
        {series.cast && series.cast.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-4">Cast</h3>
            <ScrollableRow>
              {series.cast.map(person => (
                <div key={person.id} className="card" style={{ minWidth: '140px', backgroundColor: 'var(--color-bg-surface)', border: 'none', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  {person.profile_url ? (
                    <img src={person.profile_url} alt={person.name} style={{ width: '100%', height: '175px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '175px', backgroundColor: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                  )}
                  <div className="p-2 text-center">
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{person.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{person.character}</div>
                  </div>
                </div>
              ))}
            </ScrollableRow>
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
            <p className="text-muted">No reviews yet. Be the first to review this series!</p>
          )}
        </div>

        {/* Similar Series Section */}
        {series.similar && series.similar.length > 0 && (
          <div>
            <h3 className="mb-4">Similar Series</h3>
            <ScrollableRow>
              {series.similar.map(sim => (
                <MediaCard key={sim.tmdb_id} {...sim} />
              ))}
            </ScrollableRow>
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
        mediaTitle={series.title}
      />
      <AddToListModal 
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        mediaType="series"
        mediaId={id}
        mediaTitle={series.title}
      />
    </div>
  );
};

export default SeriesDetail;
