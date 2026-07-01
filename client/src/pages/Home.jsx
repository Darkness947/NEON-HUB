import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import mediaService from '../services/mediaService';
import MediaCard from '../components/media/MediaCard';
import SkeletonCard from '../components/media/SkeletonCard';
import { truncateText } from '../utils/truncateText';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingSeries, setIsLoadingSeries] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const movies = await mediaService.fetchTrendingMovies();
        if (!cancelled) {
          setTrendingMovies(movies);
          if (movies.length > 0) {
            // Pick a random movie from top 5 for hero
            const top5 = movies.slice(0, 5);
            setFeaturedMovie(top5[Math.floor(Math.random() * top5.length)]);
          }
          setIsLoadingMovies(false);
        }
      } catch (err) {
        if (!cancelled) setIsLoadingMovies(false);
      }

      try {
        const series = await mediaService.fetchTrendingSeries();
        if (!cancelled) {
          setPopularSeries(series);
          setIsLoadingSeries(false);
        }
      } catch (err) {
        if (!cancelled) setIsLoadingSeries(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-container fade-in">
      {/* Hero Section */}
      {featuredMovie && (
        <div 
          className="hero-section"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(13, 13, 26, 0.9) 0%, rgba(13, 13, 26, 0.4) 100%), url(${featuredMovie.backdrop_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '8vh 2rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--spacing-xl)',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: 'var(--spacing-md)' }}>
              {featuredMovie.title}
            </h1>
            <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-lg)' }}>
              {truncateText(featuredMovie.overview, 150)}
            </p>
            <div className="d-flex gap-3">
              <Link to={`/movies/${featuredMovie.tmdb_id}`} className="btn btn-primary px-4 py-2">
                View Details
              </Link>
              <button className="btn btn-outline-primary px-4 py-2" onClick={() => console.log('Add to library')}>
                + Add to Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trending Movies Row */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Trending Movies</h3>
          <Link to="/discover?tab=movies" className="text-accent-blue">See All →</Link>
        </div>
        <div 
          className="d-flex gap-3"
          style={{ overflowX: 'auto', paddingBottom: 'var(--spacing-md)', scrollbarWidth: 'none' }}
        >
          {isLoadingMovies 
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : trendingMovies.map(movie => (
                <MediaCard key={movie.tmdb_id} {...movie} />
              ))
          }
        </div>
      </div>

      {/* Popular TV Series Row */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Trending TV Series</h3>
          <Link to="/discover?tab=series" className="text-accent-blue">See All →</Link>
        </div>
        <div 
          className="d-flex gap-3"
          style={{ overflowX: 'auto', paddingBottom: 'var(--spacing-md)', scrollbarWidth: 'none' }}
        >
          {isLoadingSeries
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : popularSeries.map(series => (
                <MediaCard key={series.tmdb_id} {...series} />
              ))
          }
        </div>
      </div>
    </div>
  );
};

export default Home;
