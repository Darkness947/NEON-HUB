import { useState } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import MediaCard from '../../components/media/MediaCard';
import GameCard from '../../components/media/GameCard';

const Library = () => {
  const { movies, series, games, isLoading } = useLibrary();
  const [activeTab, setActiveTab] = useState('movies');

  if (isLoading) {
    return (
      <div className="page-container fade-in">
        <h1 className="mb-4">My Library</h1>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ width: '200px', height: '300px', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)' }}></div>
          ))}
        </div>
      </div>
    );
  }

  const getActiveItems = () => {
    if (activeTab === 'movies') return movies;
    if (activeTab === 'series') return series;
    return games;
  };

  const items = getActiveItems();

  return (
    <div className="page-container fade-in">
      <h1 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>My Library</h1>
      
      <ul className="nav nav-tabs mb-4 border-0" style={{ gap: '10px' }}>
        {['movies', 'series', 'games'].map(tab => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              style={{
                backgroundColor: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--color-text-secondary)',
                border: activeTab === tab ? 'none' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-pill)',
                padding: '8px 24px'
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'movies' ? movies.length : tab === 'series' ? series.length : games.length})
            </button>
          </li>
        ))}
      </ul>

      {items.length === 0 ? (
        <div className="text-center py-5" style={{ backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📚</div>
          <h3 className="text-muted mb-3">No {activeTab} in your library yet</h3>
          <p className="text-secondary">Explore and add some {activeTab} to keep track of them here.</p>
        </div>
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
