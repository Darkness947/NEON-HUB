import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import mediaService from '../../services/mediaService';
import GameCard from '../../components/media/GameCard';
import { formatDate } from '../../utils/formatDate';

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await mediaService.getGameById(id);
        if (!cancelled) {
          setGame(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load game details');
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

  if (error || !game) {
    return (
      <div className="page-container text-center my-5">
        <h2 className="text-danger">Error</h2>
        <p>{error || 'Game not found'}</p>
      </div>
    );
  }

  // Create a blurred, darkened background from the first screenshot or poster
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
              
              <button className="btn btn-primary px-4 py-2" onClick={() => console.log('Add to library')}>
                Add to Library
              </button>
              <button className="btn btn-outline-primary" style={{ borderRadius: '50%', width: '45px', height: '45px' }} onClick={() => console.log('Favorite')}>
                ♥
              </button>
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
    </div>
  );
};

export default GameDetail;
