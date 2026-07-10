import React, { useState, useEffect } from 'react';
import reviewService from '../../services/reviewService';
import ReviewCard from '../../components/media/ReviewCard';
import SkeletonCard from '../../components/media/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const MyReviews = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteData, setDeleteData] = useState({ isOpen: false, mediaType: null, mediaId: null });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const data = await reviewService.getReviews();
      setReviews(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const requestDelete = (mediaType, mediaId) => {
    setDeleteData({ isOpen: true, mediaType, mediaId });
  };

  const confirmDelete = async () => {
    const { mediaType, mediaId } = deleteData;
    try {
      await reviewService.deleteReview(mediaType, mediaId);
      setReviews(prev => prev.filter(r => !(r.media_type === mediaType && r.media_id === mediaId)));
      toast.success('Review deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete review');
    } finally {
      setDeleteData({ isOpen: false, mediaType: null, mediaId: null });
    }
  };

  return (
    <div className="page-container fade-in">
      <h1 className="mb-4 section-title">
        {t('reviews.title')}
      </h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="d-flex gap-3 flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer" style={{
              width: '100%',
              height: '150px',
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-md)',
            }} />
          ))}
        </div>
      ) : reviews.length === 0 && !error ? (
        <EmptyState
          icon="✍️"
          title={t('reviews.noReviews')}
          message="You haven't reviewed any media yet. Head over to your library or discover page to start reviewing!"
          actionText={t('library.discoverMedia')}
          actionLink="/discover"
        />
      ) : (
        <div className="reviews-list">
          {reviews.map(review => (
            <ReviewCard 
              key={`${review.media_type}-${review.db_id}`} 
              review={review} 
              onDelete={requestDelete} 
            />
          ))}
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteData.isOpen}
        onClose={() => setDeleteData({ isOpen: false, mediaType: null, mediaId: null })}
        onConfirm={confirmDelete}
        title={t('reviews.delete')}
        message="Are you sure you want to delete this review? This cannot be undone."
        confirmText={t('reviews.delete')}
        confirmStyle="danger"
      />
    </div>
  );
};

export default MyReviews;
