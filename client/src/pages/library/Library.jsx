import { useState } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import MediaCard from '../../components/media/MediaCard';
import GameCard from '../../components/media/GameCard';
import SkeletonCard from '../../components/media/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';

const Library = () => {
  const { movies, series, games, isLoading } = useLibrary();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('movies');
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const getActiveItems = () => {
    if (activeTab === 'movies') return movies;
    if (activeTab === 'series') return series;
    return games;
  };

  const items = getActiveItems();

  const tabs = [
    { key: 'movies', label: t('nav.movies'), count: movies.length },
    { key: 'series', label: t('nav.series'), count: series.length },
    { key: 'games', label: t('nav.games'), count: games.length },
  ];

  const handleSelect = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      return prev; // Already selected 2
    });
  };

  const handleToggleCompareMode = () => {
    setIsCompareMode(!isCompareMode);
    setSelectedItems([]);
  };

  const getSingularType = (type) => {
    if (type === 'movies') return 'movie';
    if (type === 'games') return 'game';
    return type; // series remains series
  };

  const handleRecommend = () => {
    navigate(`/ai/recommendations/${getSingularType(activeTab)}`);
  };

  const handleCompare = () => {
    if (selectedItems.length === 2) {
      navigate(`/ai/compare/${getSingularType(activeTab)}/${selectedItems[0]}/${selectedItems[1]}`);
    }
  };

  // Clear selections if tab changes
  const handleTabChange = (key) => {
    setActiveTab(key);
    setSelectedItems([]);
  };

  return (
    <div className="page-container fade-in" style={{ paddingBottom: isCompareMode ? '80px' : '0' }}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap" style={{ gap: '15px' }}>
        <h1 className="section-title m-0">{t('library.title')}</h1>
        <div className="d-flex gap-2">
          {items.length >= 5 && !isCompareMode && (
            <button 
              className="btn btn-primary"
              onClick={handleRecommend}
              style={{
                borderRadius: '20px',
                padding: '6px 16px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>✨</span>
              {t('library.recommendWithAi', 'Recommend with AI')}
            </button>
          )}
          {items.length >= 2 && (
            <button 
              className={`btn ${isCompareMode ? 'btn-danger' : 'btn-outline-light'}`}
              onClick={handleToggleCompareMode}
              style={{
                borderRadius: '20px',
                padding: '6px 16px',
                fontSize: '0.9rem',
              }}
            >
              {isCompareMode ? t('library.cancelCompare', 'Cancel') : t('library.compareMode', 'Compare Mode')}
            </button>
          )}
        </div>
      </div>
      
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
              onClick={() => handleTabChange(tab.key)}
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
          title={t('library.emptyTitle', { type: t(`nav.${activeTab}`) })}
          message={t('library.emptyMessage', { type: t(`nav.${activeTab}`) })}
          actionText={t('home.startExploring')}
          actionLink={`/discover?tab=${activeTab}`}
        />
      ) : (
        <div className="media-grid">
          {items.map(item => {
            const id = activeTab === 'games' ? item.rawg_id : item.tmdb_id;
            const isSelected = selectedItems.includes(id);
            const props = {
              key: id,
              ...item,
              showDropdown: !isCompareMode,
              selectable: isCompareMode,
              selected: isSelected,
              onSelect: handleSelect
            };
            return activeTab === 'games' ? <GameCard {...props} /> : <MediaCard {...props} />;
          })}
        </div>
      )}

      {isCompareMode && (
        <div 
          className="position-fixed bottom-0 start-0 w-100 d-flex justify-content-between align-items-center px-4 py-3"
          style={{
            backgroundColor: 'rgba(10, 10, 10, 0.95)',
            borderTop: '1px solid var(--border-neon)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
          }}
        >
          <div>
            <h5 className="m-0 mb-1" style={{ color: 'var(--color-accent-purple)' }}>{t('library.compareMode', 'Compare Mode')}</h5>
            <div className="text-muted small">
              {selectedItems.length} {t('library.selectedOutOfTwo', 'of 2 selected')}
            </div>
          </div>
          <button 
            className="btn btn-primary"
            disabled={selectedItems.length !== 2}
            onClick={handleCompare}
            style={{
              borderRadius: '20px',
              padding: '8px 24px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>✨</span>
            {t('library.compareWithAi', 'Compare with AI')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Library;
