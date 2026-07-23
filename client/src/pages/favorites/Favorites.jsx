import { useState, useMemo, useEffect } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import libraryService from '../../services/libraryService';
import MediaCard from '../../components/media/MediaCard';
import GameCard from '../../components/media/GameCard';
import SkeletonCard from '../../components/media/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';
import { useTranslation } from 'react-i18next';

const Favorites = () => {
  const { t } = useTranslation();
  const { movies, series, games, isLoading: isLibraryLoading } = useLibrary();
  const [activeTab, setActiveTab] = useState('all');
  const [hydratedItems, setHydratedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchFavs = async () => {
      try {
        setIsLoading(true);
        const data = await libraryService.getFavorites();
        if (!cancelled) setHydratedItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchFavs();
    return () => { cancelled = true; };
  }, []);

  const favorites = useMemo(() => {
    // Filter hydrated items to only show those STILL marked as favorite in the global context
    // This gives us instant UI updates when un-favoriting a card
    const activeMovies = new Set(movies.filter(m => m.favorite).map(m => m.tmdb_id));
    const activeSeries = new Set(series.filter(s => s.favorite).map(s => s.tmdb_id));
    const activeGames = new Set(games.filter(g => g.favorite).map(g => g.rawg_id));

    return {
      movies: hydratedItems.filter(item => item.media_type === 'movie' && activeMovies.has(item.id || item.tmdb_id)),
      series: hydratedItems.filter(item => item.media_type === 'series' && activeSeries.has(item.id || item.tmdb_id)),
      games: hydratedItems.filter(item => item.media_type === 'game' && activeGames.has(item.id || item.rawg_id))
    };
  }, [hydratedItems, movies, series, games]);

  const getActiveItems = () => {
    if (activeTab === 'movies') return favorites.movies;
    if (activeTab === 'series') return favorites.series;
    if (activeTab === 'games') return favorites.games;
    return [...favorites.movies, ...favorites.series, ...favorites.games];
  };

  const items = getActiveItems();
  const totalCount = favorites.movies.length + favorites.series.length + favorites.games.length;

  const tabs = [
    { key: 'all', label: t('library.all'), count: totalCount },
    { key: 'movies', label: t('nav.movies'), count: favorites.movies.length },
    { key: 'series', label: t('nav.series'), count: favorites.series.length },
    { key: 'games', label: t('nav.games'), count: favorites.games.length },
  ];

  return (
    <div className="page-container fade-in">
      <h1 className="mb-4 section-title">{t('favorites.title')}</h1>
      
      <ul className="nav nav-tabs mb-4 border-0" style={{ gap: '10px' }}>
        {tabs.map(tab => (
          <li className="nav-item" key={tab.key}>
            <button
              className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
              style={{
                backgroundColor: activeTab === tab.key ? 'var(--color-accent-purple)' : 'transparent',
                color: activeTab === tab.key ? '#fff' : 'var(--color-text-muted)',
                border: activeTab === tab.key ? 'none' : '1px solid var(--border-neon)',
                borderRadius: 'var(--radius-full)',
                padding: '8px 24px',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                letterSpacing: '0.5px',
                transition: 'all var(--transition-neon)',
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} ({tab.count})
            </button>
          </li>
        ))}
      </ul>

      {isLoading ? (
        <div className="media-grid">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="♥"
          title={t('favorites.noFavorites')}
          message="Click the heart icon on any media card to add it to your favorites."
          actionText={t('library.discoverMedia')}
          actionLink="/discover"
        />
      ) : (
        <div className="media-grid">
          {items.map(item => (
            item.media_type === 'game' 
              ? <GameCard key={item.rawg_id} {...item} showDropdown={true} />
              : <MediaCard key={item.tmdb_id} {...item} showDropdown={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
