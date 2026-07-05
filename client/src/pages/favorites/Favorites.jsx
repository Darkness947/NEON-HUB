import { useState, useMemo } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import MediaCard from '../../components/media/MediaCard';
import GameCard from '../../components/media/GameCard';
import SkeletonCard from '../../components/media/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';

const Favorites = () => {
  const { movies, series, games, isLoading } = useLibrary();
  const [activeTab, setActiveTab] = useState('all');

  const favorites = useMemo(() => {
    return {
      movies: movies.filter(m => m.favorite),
      series: series.filter(s => s.favorite),
      games: games.filter(g => g.favorite)
    };
  }, [movies, series, games]);

  const getActiveItems = () => {
    if (activeTab === 'movies') return favorites.movies;
    if (activeTab === 'series') return favorites.series;
    if (activeTab === 'games') return favorites.games;
    return [...favorites.movies, ...favorites.series, ...favorites.games];
  };

  const items = getActiveItems();
  const totalCount = favorites.movies.length + favorites.series.length + favorites.games.length;

  const tabs = [
    { key: 'all', label: 'All', count: totalCount },
    { key: 'movies', label: 'Movies', count: favorites.movies.length },
    { key: 'series', label: 'Series', count: favorites.series.length },
    { key: 'games', label: 'Games', count: favorites.games.length },
  ];

  return (
    <div className="page-container fade-in">
      <h1 className="mb-4 section-title">Favorites</h1>
      
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
          title={`No ${activeTab === 'all' ? 'favorites' : activeTab} yet`}
          message="Click the heart icon on any media card to add it to your favorites."
          actionText="Discover Media"
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
