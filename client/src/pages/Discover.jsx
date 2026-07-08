import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import mediaService from '../services/mediaService';
import MediaCard from '../components/media/MediaCard';
import GameCard from '../components/media/GameCard';
import SkeletonCard from '../components/media/SkeletonCard';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { useTranslation } from 'react-i18next';

const Discover = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'movies';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const [loaderRef, isIntersecting] = useIntersectionObserver();

  // Reset when tab changes
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  // Fetch data
  useEffect(() => {
    let cancelled = false;

    const loadMore = async () => {
      if (!hasMore) return;
      setIsLoading(true);

      try {
        let response;
        if (activeTab === 'movies') {
          response = await mediaService.fetchPopularMovies(page);
        } else if (activeTab === 'series') {
          response = await mediaService.fetchPopularSeries(page);
        } else if (activeTab === 'games') {
          // fetchTrendingGames supports pagination now
          const gamesData = await mediaService.fetchTrendingGames(page);
          // Assuming rawgService returns just an array, but wait...
          // If mediaService.fetchTrendingGames(page) just returns the array, we need to mock total_pages.
          // Or let's assume if gamesData is length > 0, page is valid.
          // Our backend currently returns the array directly.
          response = { results: gamesData, page, total_pages: gamesData.length > 0 ? page + 1 : page };
        }

        if (!cancelled) {
          if (page === 1) {
            setItems(response.results || []);
          } else {
            setItems(prev => [...prev, ...(response.results || [])]);
          }
          setHasMore(response.page < (response.total_pages || 1));
          setIsLoading(false);
        }
      } catch (error) {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadMore();

    return () => {
      cancelled = true;
    };
  }, [activeTab, page]);

  // Trigger next page on scroll
  useEffect(() => {
    if (isIntersecting && hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [isIntersecting, hasMore, isLoading]);

  return (
    <div className="page-container fade-in">
      <h1 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>{t('discover.title')}</h1>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4" style={{ borderBottomColor: 'var(--color-bg-elevated)' }}>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'movies' ? 'active text-accent-purple' : 'text-muted'}`}
            style={{ 
              backgroundColor: 'transparent', 
              borderColor: activeTab === 'movies' ? 'var(--color-bg-elevated) var(--color-bg-elevated) var(--color-bg-deep)' : 'transparent',
              borderBottomColor: activeTab === 'movies' ? 'var(--color-bg-deep)' : 'transparent'
            }}
            onClick={() => setActiveTab('movies')}
          >
            {t('nav.movies')}
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'series' ? 'active text-accent-purple' : 'text-muted'}`}
            style={{ 
              backgroundColor: 'transparent', 
              borderColor: activeTab === 'series' ? 'var(--color-bg-elevated) var(--color-bg-elevated) var(--color-bg-deep)' : 'transparent',
              borderBottomColor: activeTab === 'series' ? 'var(--color-bg-deep)' : 'transparent'
            }}
            onClick={() => setActiveTab('series')}
          >
            {t('nav.series')}
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'games' ? 'active text-accent-purple' : 'text-muted'}`}
            style={{ 
              backgroundColor: 'transparent', 
              borderColor: activeTab === 'games' ? 'var(--color-bg-elevated) var(--color-bg-elevated) var(--color-bg-deep)' : 'transparent',
              borderBottomColor: activeTab === 'games' ? 'var(--color-bg-deep)' : 'transparent'
            }}
            onClick={() => setActiveTab('games')}
          >
            {t('nav.games')}
          </button>
        </li>
      </ul>

      {/* Grid */}
      <div 
        className="d-grid gap-4" 
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
      >
        {items.map((item, i) => (
          activeTab === 'games' 
            ? <GameCard key={`${item.rawg_id}-${i}`} {...item} />
            : <MediaCard key={`${item.tmdb_id}-${i}`} {...item} />
        ))}
        {isLoading && Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
      </div>

      {/* Intersection Observer Target */}
      <div ref={loaderRef} style={{ height: '20px', margin: '20px 0' }}></div>
    </div>
  );
};

export default Discover;
