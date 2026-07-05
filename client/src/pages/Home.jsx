import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import mediaService from '../services/mediaService';
import MediaCard from '../components/media/MediaCard';
import GameCard from '../components/media/GameCard';
import SkeletonCard from '../components/media/SkeletonCard';
import { truncateText } from '../utils/truncateText';
import { useLibrary } from '../hooks/useLibrary';

const Home = () => {
  const { isInLibrary, addToLibrary, removeFromLibrary } = useLibrary();
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [trendingGames, setTrendingGames] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingSeries, setIsLoadingSeries] = useState(true);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const movies = await mediaService.fetchTrendingMovies();
        if (!cancelled) {
          setTrendingMovies(movies);
          setIsLoadingMovies(false);
        }
      } catch (err) {
        if (!cancelled) {
          setIsLoadingMovies(false);
          setError(err.message || 'Failed to load media');
        }
      }

      try {
        const series = await mediaService.fetchTrendingSeries();
        if (!cancelled) {
          setPopularSeries(series);
          setIsLoadingSeries(false);
        }
      } catch (err) {
        if (!cancelled) {
          setIsLoadingSeries(false);
          setError(err.message || 'Failed to load media');
        }
      }

      try {
        const games = await mediaService.fetchTrendingGames();
        if (!cancelled) {
          setTrendingGames(games);
          setIsLoadingGames(false);
        }
      } catch (err) {
        if (!cancelled) {
          setIsLoadingGames(false);
          setError(err.message || 'Failed to load media');
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (trendingMovies.length > 0 && popularSeries.length > 0 && trendingGames.length > 0) {
      const randomMovie = trendingMovies[Math.floor(Math.random() * Math.min(trendingMovies.length, 10))];
      const randomSeries = popularSeries[Math.floor(Math.random() * Math.min(popularSeries.length, 10))];
      const randomGame = trendingGames[Math.floor(Math.random() * Math.min(trendingGames.length, 10))];
      setFeaturedItems([
        { ...randomMovie, type: 'movie' },
        { ...randomSeries, type: 'series' },
        { ...randomGame, type: 'game' }
      ]);
      setCurrentHeroIndex(Math.floor(Math.random() * 3));
    }
  }, [trendingMovies, popularSeries, trendingGames]);

  const handlePrevHero = () => {
    setCurrentHeroIndex(prev => (prev === 0 ? featuredItems.length - 1 : prev - 1));
  };

  const handleNextHero = () => {
    setCurrentHeroIndex(prev => (prev === featuredItems.length - 1 ? 0 : prev + 1));
  };

  const currentItem = featuredItems[currentHeroIndex];
  const itemType = currentItem ? currentItem.type : null;
  const itemId = currentItem ? currentItem.id : null;
  const libraryItem = currentItem ? isInLibrary(itemType, itemId) : null;
  const inLibrary = !!libraryItem;

  const linkTo = currentItem 
    ? (itemType === 'game' ? `/games/${itemId}` : itemType === 'movie' ? `/movies/${itemId}` : `/series/${itemId}`)
    : '';

  return (
    <div className="page-container fade-in">
      {error && (
        <div className="alert alert-danger mb-4">
          Error loading media: {error}. Please ensure your API keys are correct and the backend is running.
        </div>
      )}

      {/* Hero Section */}
      {currentItem && (
        <div 
          className="hero-section"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(13, 13, 26, 0.95) 0%, rgba(13, 13, 26, 0.4) 100%), url(${itemType === 'game' ? currentItem.poster_url : (currentItem.backdrop_url || currentItem.poster_url)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '8vh 2rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--spacing-xl)',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Left Navigation Arrow */}
          <button 
            className="hero-arrow hero-arrow-left" 
            onClick={handlePrevHero} 
            aria-label="Previous featured item"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>

          <div style={{ maxWidth: '600px', marginLeft: '60px', marginRight: '60px', zIndex: 5 }}>
            <span className="badge mb-3 px-3 py-2" style={{ backgroundColor: 'var(--color-accent-purple)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', borderRadius: '12px' }}>
              Featured {itemType === 'game' ? 'Game' : itemType === 'movie' ? 'Movie' : 'TV Series'}
            </span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', marginBottom: 'var(--spacing-md)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              {currentItem.title}
            </h1>
            <p className="text-muted" style={{ fontSize: '1.05rem', marginBottom: 'var(--spacing-lg)', lineHeight: '1.6' }}>
              {truncateText(currentItem.overview || 'No overview available.', 150)}
            </p>
            <div className="d-flex gap-3">
              <Link to={linkTo} className="btn btn-primary px-4 py-2" style={{ borderRadius: '20px', fontWeight: '600' }}>
                View Details
              </Link>
              <button 
                className="btn btn-outline-primary px-4 py-2" 
                style={{
                  backgroundColor: inLibrary ? 'var(--color-success)' : 'transparent',
                  borderColor: inLibrary ? 'var(--color-success)' : 'var(--color-accent-purple)',
                  color: '#fff',
                  borderRadius: '20px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onClick={async () => {
                  if (inLibrary) {
                    await removeFromLibrary(itemType, itemId);
                  } else {
                    await addToLibrary(itemType, itemId, itemType === 'game' ? 'backlog' : 'planned');
                  }
                }}
                onMouseOver={(e) => {
                  if (inLibrary) {
                    e.currentTarget.style.backgroundColor = 'var(--color-danger)';
                    e.currentTarget.style.borderColor = 'var(--color-danger)';
                    e.currentTarget.innerText = '✕ Remove from Library';
                  }
                }}
                onMouseOut={(e) => {
                  if (inLibrary) {
                    e.currentTarget.style.backgroundColor = 'var(--color-success)';
                    e.currentTarget.style.borderColor = 'var(--color-success)';
                    e.currentTarget.innerText = '✓ In Library';
                  }
                }}
              >
                {inLibrary ? '✓ In Library' : '+ Add to Library'}
              </button>
            </div>
          </div>

          {/* Right Navigation Arrow */}
          <button 
            className="hero-arrow hero-arrow-right" 
            onClick={handleNextHero} 
            aria-label="Next featured item"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      )}

      {/* Trending Movies Row */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0 section-title">Trending Movies</h3>
          <Link to="/discover?tab=movies" className="text-accent-blue">See All →</Link>
        </div>
        <div 
          className="d-flex gap-3"
          style={{ overflowX: 'auto', paddingBottom: 'var(--spacing-md)', scrollbarWidth: 'none' }}
        >
          {isLoadingMovies 
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : trendingMovies.map(movie => (
                <MediaCard key={movie.id || movie.tmdb_id} {...movie} />
              ))
          }
        </div>
      </div>

      {/* Popular TV Series Row */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0 section-title">Trending TV Series</h3>
          <Link to="/discover?tab=series" className="text-accent-blue">See All →</Link>
        </div>
        <div 
          className="d-flex gap-3"
          style={{ overflowX: 'auto', paddingBottom: 'var(--spacing-md)', scrollbarWidth: 'none' }}
        >
          {isLoadingSeries
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : popularSeries.map(series => (
                <MediaCard key={series.id || series.tmdb_id} {...series} />
              ))
          }
        </div>
      </div>

      {/* Trending Games Row */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0 section-title">Trending Games</h3>
          <Link to="/discover?tab=games" className="text-accent-blue">See All →</Link>
        </div>
        <div 
          className="d-flex gap-3"
          style={{ overflowX: 'auto', paddingBottom: 'var(--spacing-md)', scrollbarWidth: 'none' }}
        >
          {isLoadingGames
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : trendingGames.map(game => (
                <GameCard key={game.id || game.rawg_id} {...game} />
              ))
          }
        </div>
      </div>
    </div>
  );
};

export default Home;
