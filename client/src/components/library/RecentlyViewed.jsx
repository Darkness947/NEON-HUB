import React, { useState, useEffect } from 'react';
import historyService from '../../services/historyService';
import MediaCard from '../media/MediaCard';
import SkeletonCard from '../media/SkeletonCard';
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
      <div className="container mt-4 text-center text-muted">
        <h4>{t('library.noRecentActivity')}</h4>
        <p>{t('library.noRecentActivityMessage')}</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 pb-5">
      {isEditMode && (
        <div className="d-flex justify-content-between align-items-center mb-4 bg-dark p-3 rounded fade-in sticky-top" style={{ top: '80px', zIndex: 100 }}>
          <div>
            <span className="fw-bold me-3 text-light">{t('library.selectedCount', { count: selectedIds.size })}</span>
            <button className="btn btn-sm btn-outline-light me-2" onClick={handleSelectAll}>
              {selectedIds.size === history.length ? t('library.deselectAll') : t('library.selectAll')}
            </button>
            <button 
              className="btn btn-sm btn-danger" 
              disabled={selectedIds.size === 0}
              onClick={handleRemoveSelected}
            >
              {t('library.removeSelected')}
            </button>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={() => { setEditMode(false); setSelectedIds(new Set()); }}>
            {t('library.cancel')}
          </button>
        </div>
      )}

      <div className="row g-4">
        {history.map((item) => (
          <div key={item.history_id} className="col-6 col-sm-4 col-md-3 col-lg-2 position-relative">
            {isEditMode && (
              <div 
                className="position-absolute w-100 h-100" 
                style={{ zIndex: 10, cursor: 'pointer', backgroundColor: selectedIds.has(item.history_id) ? 'rgba(0,0,0,0.5)' : 'transparent' }}
                onClick={() => handleSelect(item.history_id)}
              >
                <div 
                  className="position-absolute rounded-circle bg-dark d-flex align-items-center justify-content-center"
                  style={{ 
                    top: '10px', 
                    right: '10px', 
                    width: '30px', 
                    height: '30px',
                    border: '2px solid white',
                    color: selectedIds.has(item.history_id) ? 'var(--color-accent-blue)' : 'transparent'
                  }}
                >
                  ✓
                </div>
              </div>
            )}
            
            <MediaCard
              item={{...item, media_type: item.media_type, id: item.media_id}}
              type={item.media_type}
            />

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
