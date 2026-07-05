import { useState } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import MediaCard from '../../components/media/MediaCard';
import GameCard from '../../components/media/GameCard';
import SkeletonCard from '../../components/media/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';

const Library = () => {
  const { movies, series, games, isLoading } = useLibrary();
  const [activeTab, setActiveTab] = useState('movies');

  const getActiveItems = () => {
    if (activeTab === 'movies') return movies;
    if (activeTab === 'series') return series;
    return games;
  };

  const items = getActiveItems();

  const tabs = [
    { key: 'movies', label: 'Movies', count: movies.length },
    { key: 'series', label: 'Series', count: series.length },
    { key: 'games', label: 'Games', count: games.length },
  ];

  return (
    <div className="page-container fade-in">
      <h1 className="mb-4 section-title">My Library</h1>
      
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
          icon="📚"
          title={`No ${activeTab} in your library yet`}
          message={`Explore and add some ${activeTab} to keep track of what you're watching and playing.`}
          actionText="Discover Media"
          actionLink={`/discover?tab=${activeTab}`}
        />
      ) : (
        <div className="media-grid">
          {items.map(item => (
            activeTab === 'games' 
              ? <GameCard key={item.rawg_id} {...item} showDropdown={true} />
              : <MediaCard key={item.tmdb_id} {...item} showDropdown={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;
