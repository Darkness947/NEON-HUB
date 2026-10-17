import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import libraryService from '../../services/libraryService';
import ReviewCard from '../../components/media/ReviewCard';
import EmptyState from '../../components/common/EmptyState';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 18;

const RatingCardSkeleton = () => (
  <div className="card p-3 h-100 skeleton-shimmer" style={{ backgroundColor: 'var(--color-bg-elevated)', border: 'none', minHeight: '130px' }}>
    <div className="d-flex gap-3">
      <div style={{ width: '60px', height: '88px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
      <div className="flex-grow-1 d-flex flex-column justify-content-center">
        <div style={{ width: '70%', height: '1.1rem', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: '8px' }} />
        <div style={{ width: '35%', height: '0.8rem', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: '10px' }} />
        <div style={{ width: '50%', height: '0.8rem', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
      </div>
    </div>
  </div>
);

const MyRatings = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [ratings, setRatings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadRatings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await libraryService.getRatings(1, PAGE_SIZE);
        if (!cancelled) {
          if (Array.isArray(res)) {
            setRatings(res);
            setHasMore(false);
            setTotalCount(res.length);
          } else {
            setRatings(res.items || []);
            setHasMore(Boolean(res.hasMore));
            setTotalCount(res.total ?? (res.items?.length || 0));
          }
          setPage(1);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load ratings');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    if (user) {
      loadRatings();
    }

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await libraryService.getRatings(nextPage, PAGE_SIZE);
      const newItems = Array.isArray(res) ? res : (res.items || []);
      setRatings(prev => [...prev, ...newItems]);
      setPage(nextPage);
      setHasMore(Array.isArray(res) ? false : Boolean(res.hasMore));
    } catch (err) {
      setError(err.message || 'Failed to load more ratings');
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>
          {t('ratings.title')}
          {totalCount !== null && (
            <span className="text-muted ms-2" style={{ fontSize: '1.2rem', fontWeight: 400 }}>
              ({totalCount})
            </span>
          )}
        </h1>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="row g-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="col-12 col-md-6 col-lg-4">
              <RatingCardSkeleton />
            </div>
          ))}
        </div>
      ) : ratings.length === 0 ? (
        <EmptyState 
          title={t('ratings.noRatings')} 
          message={t('ratings.emptyMessage')} 
        />
      ) : (
        <>
          <div className="row g-4">
            {ratings.map((rating) => (
              <div key={`${rating.media_type}-${rating.db_id || rating.id}`} className="col-12 col-md-6 col-lg-4">
                <ReviewCard review={rating} />
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-5">
              <button
                className="btn btn-outline-primary px-4 py-2"
                style={{ borderRadius: '20px', fontWeight: 600, minWidth: '150px' }}
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                ) : null}
                {isLoadingMore ? t('common.loading') || 'Loading...' : t('common.loadMore') || 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyRatings;
