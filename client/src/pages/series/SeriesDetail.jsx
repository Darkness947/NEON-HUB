import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import mediaService from '../../services/mediaService';
import MediaCard from '../../components/media/MediaCard';
import { formatDate } from '../../utils/formatDate';

const SeriesDetail = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await mediaService.getSeriesById(id);
        if (!cancelled) {
          setSeries(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load series details');
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
      </div>
    );
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
              
              <button className="btn btn-primary px-4 py-2" onClick={() => console.log('Add to library')}>
                Add to Library
              </button>
              <button className="btn btn-outline-primary" style={{ borderRadius: '50%', width: '45px', height: '45px' }} onClick={() => console.log('Favorite')}>
                ♥
              </button>
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

        {/* Cast Section */}
        {series.cast && series.cast.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-4">Series Cast</h3>
            <div className="d-flex gap-3" style={{ overflowX: 'auto', paddingBottom: 'var(--spacing-md)', scrollbarWidth: 'none' }}>
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
            </div>
          </div>
        )}

        {/* Similar Series Section */}
        {series.similar && series.similar.length > 0 && (
          <div>
            <h3 className="mb-4">Similar Series</h3>
            <div className="d-flex gap-3" style={{ overflowX: 'auto', paddingBottom: 'var(--spacing-md)', scrollbarWidth: 'none' }}>
              {series.similar.map(sim => (
                <MediaCard key={sim.tmdb_id} {...sim} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesDetail;
