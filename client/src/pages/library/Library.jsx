import { useState, useEffect, useCallback } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import libraryService from '../../services/libraryService';
import MediaCard from '../../components/media/MediaCard';
import GameCard from '../../components/media/GameCard';
import SkeletonCard from '../../components/media/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';

const Library = () => {
  const { movies: movieIds, series: seriesIds, games: gameIds, isInLibrary, hasIdsError } = useLibrary();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('movies');
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Page-level fetching with pagination
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPage = useCallback(async (type, pageNum, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      const result = await libraryService.getLibrary(type, '', pageNum);
      if (append) {
        setItems(prev => [...prev, ...result.items]);
      } else {
        setItems(result.items);
      }
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch library page:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(false);
    fetchPage(activeTab, 1);
  }, [activeTab, fetchPage]);

  const handleLoadMore = () => {
    fetchPage(activeTab, page + 1, true);
  };

  // Use context ID counts for tab totals (always accurate)
  const tabs = [
    { key: 'movies', label: t('nav.movies'), count: movieIds.length },
    { key: 'series', label: t('nav.series'), count: seriesIds.length },
    { key: 'games', label: t('nav.games'), count: gameIds.length },
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
          {total >= 5 && !isCompareMode && (
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
          {total >= 2 && (
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
        <>
          <div className="media-grid">
            {items.filter(item => {
              if (hasIdsError) return true; // Fallback to showing everything if the IDs fetch failed
              const id = activeTab === 'games' ? item.rawg_id : item.tmdb_id;
              const type = activeTab === 'movies' ? 'movie' : activeTab === 'series' ? 'series' : 'game';
              return isInLibrary(type, id);
            }).map(item => {
              const id = activeTab === 'games' ? item.rawg_id : item.tmdb_id;
              const isSelected = selectedItems.includes(id);
              const props = {
                ...item,
                showDropdown: !isCompareMode,
                selectable: isCompareMode,
                selected: isSelected,
                onSelect: handleSelect
              };
              return activeTab === 'games' ? <GameCard key={item.db_id} {...props} /> : <MediaCard key={item.db_id} {...props} />;
            })}
          </div>

          {hasMore && (
            <div className="text-center mt-4 mb-3">
              <button
                className="btn btn-outline-light"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                style={{
                  borderRadius: '20px',
                  padding: '10px 32px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                }}
              >
                {isLoadingMore ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading...
                  </>
                ) : (
                  `Load More (${items.length} of ${total})`
                )}
              </button>
            </div>
          )}
        </>
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
