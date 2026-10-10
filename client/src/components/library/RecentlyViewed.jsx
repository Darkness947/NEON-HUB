import React, { useState, useEffect } from 'react';
import historyService from '../../services/historyService';
import MediaCard from '../media/MediaCard';
import SkeletonCard from '../media/SkeletonCard';
import GameCard from '../media/GameCard';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLibrary } from '../../hooks/useLibrary';

const RecentlyViewed = ({ isEditMode, setEditMode }) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const { addToLibrary } = useLibrary();

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const data = await historyService.getHistory();
        if (!cancelled) setHistory(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load history');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (historyId) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(historyId)) {
      newSet.delete(historyId);
    } else {
      newSet.add(historyId);
    }
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === history.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(history.map(item => item.history_id)));
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      const idsToRemove = Array.from(selectedIds);
      await historyService.removeHistory(idsToRemove);
      setHistory(prev => prev.filter(item => !idsToRemove.includes(item.history_id)));
      toast.success(t('library.removedItems', { count: idsToRemove.length }));
      setSelectedIds(new Set());
      setEditMode(false);
    } catch (err) {
      toast.error(err.message || 'Failed to remove from history');
    }
  };

  const handleAddFromHistory = async (mediaType, mediaId) => {
    try {
      await addToLibrary(mediaType, mediaId, 'planned');
      toast.success('Added to library!');
      // Update local state to reflect it's now in the library
      setHistory(prev => prev.map(item => 
        (item.media_type === mediaType && String(item.media_id) === String(mediaId))
          ? { ...item, status: 'planned' } 
          : item
      ));
    } catch (err) {
      toast.error('Failed to add to library');
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="row g-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
              <SkeletonCard />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4 text-center">
        <h4 className="text-danger">{error}</h4>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="container mt-4">
        <EmptyState
          icon="🕒"
          title={t('library.noRecentActivity')}
          message={t('library.noRecentActivityMessage')}
          actionText={t('library.discoverMedia')}
          actionLink="/discover"
        />
      </div>
    );
  }

  return (
    <div className="container mt-4 pb-5">
      {isEditMode && (
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
            <h5 className="m-0 mb-1" style={{ color: 'var(--color-accent-purple)' }}>{t('library.edit', 'Edit Mode')}</h5>
            <div className="text-muted small">
              {selectedIds.size} {t('library.selectedOutOfTotal', 'selected')}
            </div>
          </div>
          
          <div className="d-flex gap-2 align-items-center">
            <button 
              className="btn btn-outline-light"
              onClick={handleSelectAll}
              style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '0.9rem' }}
            >
              {selectedIds.size === history.length ? t('library.deselectAll') : t('library.selectAll')}
            </button>
            <button 
              className="btn btn-danger" 
              disabled={selectedIds.size === 0}
              onClick={handleRemoveSelected}
              style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '0.9rem' }}
            >
              {t('library.removeSelected')}
            </button>
            <button 
              className="btn btn-secondary ms-2"
              onClick={() => { setEditMode(false); setSelectedIds(new Set()); }}
              style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '0.9rem' }}
            >
              {t('library.cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="row g-4">
        {history.map((item) => (
          <div key={item.history_id} className="col-6 col-sm-4 col-md-3 col-lg-2 position-relative">
            {item.media_type === 'game' ? (
              <GameCard
                {...item}
                media_type={item.media_type}
                id={item.media_id}
                selectable={isEditMode}
                selected={selectedIds.has(item.history_id)}
                onSelect={() => handleSelect(item.history_id)}
              />
            ) : (
              <MediaCard
                {...item}
                media_type={item.media_type}
                id={item.media_id}
                selectable={isEditMode}
                selected={selectedIds.has(item.history_id)}
                onSelect={() => handleSelect(item.history_id)}
              />
            )}

            {!isEditMode && !item.status && (
              <div className="mt-2 w-100 text-center">
                <button 
                  className="btn btn-sm btn-outline-primary w-100" 
                  onClick={() => handleAddFromHistory(item.media_type, item.media_id)}
                >
                  ➕ {t('media.addToLibrary')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
