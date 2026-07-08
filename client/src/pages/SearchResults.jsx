import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import mediaService from '../services/mediaService';
import MediaCard from '../components/media/MediaCard';
import GameCard from '../components/media/GameCard';
import SkeletonCard from '../components/media/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import { useTranslation } from 'react-i18next';

const SearchResults = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q');
  const initialTab = searchParams.get('tab') || 'movies';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state with URL params
  useEffect(() => {
    setSearchParams({ q: query, tab: activeTab });
  }, [activeTab, query, setSearchParams]);

  useEffect(() => {
    let cancelled = false;

    const performSearch = async () => {
      if (!query) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        let response;
        if (activeTab === 'movies') {
          response = await mediaService.searchMovies(query);
        } else if (activeTab === 'series') {
          response = await mediaService.searchSeries(query);
        } else if (activeTab === 'games') {
          const gamesData = await mediaService.searchGames(query);
          response = { results: gamesData };
        }

        if (!cancelled) {
          setItems(response.results || []);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) setIsLoading(false);
      }
    };

    performSearch();

    return () => {
      cancelled = true;
    };
  }, [query, activeTab]);

  return (
    <div className="page-container fade-in">
      <h2 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>
        {t('discover.resultsFor')} "{query}"
      </h2>

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

      {/* Results Grid */}
      <div className="d-grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : items.length > 0 ? (
          items.map(item => (
            activeTab === 'games'
              ? <GameCard key={item.rawg_id} {...item} />
              : <MediaCard key={item.tmdb_id} {...item} />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState
              icon="🔍"
              title={t('discover.noResults')}
              message={t('discover.tryDifferent')}
              actionText={t('library.discoverMedia')}
              actionLink="/discover"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
