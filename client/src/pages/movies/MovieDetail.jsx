import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import mediaService from '../../services/mediaService';
import MediaCard from '../../components/media/MediaCard';
import { formatDate } from '../../utils/formatDate';
import { useLibrary } from '../../hooks/useLibrary';
import { getStatusColor } from '../../utils/getStatusColor';
import FavoriteButton from '../../components/media/FavoriteButton';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getStatus, isInLibrary, addToLibrary, removeFromLibrary } = useLibrary();
  const currentStatus = getStatus('movie', id);
  const libraryItem = isInLibrary('movie', id);
  const isFavorite = libraryItem ? libraryItem.favorite : false;

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await mediaService.getMovieById(id);
        if (!cancelled) {
          setMovie(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load movie details');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="page-container fade-in">
        <div style={{ height: '400px', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-lg)' }} className="mb-4"></div>
        <div style={{ height: '20px', width: '50%', backgroundColor: 'var(--color-bg-elevated)', marginBottom: '10px' }}></div>
        <div style={{ height: '20px', width: '80%', backgroundColor: 'var(--color-bg-elevated)' }}></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="page-container text-center my-5">
        <h2 className="text-danger">Error</h2>
        <p>{error || 'Movie not found'}</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div 
        style={{
          backgroundImage: `linear-gradient(to right, rgba(13, 13, 26, 0.95) 0%, rgba(13, 13, 26, 0.7) 100%), url(${movie.backdrop_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: 'var(--spacing-3xl) 0',
          minHeight: '500px',
        }}
      >
        <div className="container d-flex flex-column flex-md-row gap-5 align-items-center align-items-md-start">
          <img 
            src={movie.poster_url} 
            alt={movie.title} 
            style={{ width: '300px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}
          />
          
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '3rem', marginBottom: 'var(--spacing-xs)' }}>
              {movie.title} <span className="text-muted" style={{ fontWeight: 400 }}>({movie.release_date?.slice(0, 4)})</span>
            </h1>
            
            <div className="d-flex align-items-center gap-3 mb-3 text-muted">
              <span>{formatDate(movie.release_date)}</span>
              <span>•</span>
              <span>{movie.genres?.map(g => g.name).join(', ')}</span>
              <span>•</span>
              <span>{movie.runtime} min</span>
            </div>

            <div className="d-flex align-items-center gap-4 mb-4">
              <div className="d-flex align-items-center gap-2">
                <div style={{ 
                  width: '50px', height: '50px', borderRadius: '50%', 
                  backgroundColor: 'var(--color-bg-deep)', border: '3px solid var(--color-success)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                  {Math.round(movie.vote_average * 10)}%
                </div>
                <strong>User<br/>Score</strong>
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
                      await removeFromLibrary('movie', id);
                    } else {
                      await addToLibrary('movie', id, 'planned');
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
                <FavoriteButton mediaType="movie" mediaId={id} isFavorite={isFavorite} />
              </div>
            </div>

            <h5 className="text-muted" style={{ fontStyle: 'italic', marginBottom: 'var(--spacing-md)' }}>
              {movie.tagline}
            </h5>

            <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--spacing-sm)' }}>Overview</h4>
            <p style={{ lineHeight: 1.8, fontSize: '1.1rem' }}>{movie.overview}</p>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-3xl)' }}>
        {/* Cast Section */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-4">Top Billed Cast</h3>
            <div className="d-flex gap-3" style={{ overflowX: 'auto', paddingBottom: 'var(--spacing-md)', scrollbarWidth: 'none' }}>
              {movie.cast.map(person => (
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
            </div>
          </div>
        )}

        {/* Similar Movies Section */}
        {movie.similar && movie.similar.length > 0 && (
          <div>
            <h3 className="mb-4">Similar Movies</h3>
            <div className="d-flex gap-3" style={{ overflowX: 'auto', paddingBottom: 'var(--spacing-md)', scrollbarWidth: 'none' }}>
              {movie.similar.map(sim => (
                <MediaCard key={sim.tmdb_id} {...sim} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
