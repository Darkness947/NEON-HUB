import React, { useState, useEffect } from 'react';
import reviewService from '../../services/reviewService';
import ReviewCard from '../../components/media/ReviewCard';
import FullPageLoader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

const MyReviews = () => {
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

  if (isLoading) return <FullPageLoader />;

  return (
    <div className="page-container fade-in">
      <h1 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>
        My <span className="text-accent-purple">Reviews</span>
      </h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {reviews.length === 0 && !error ? (
        <div className="card p-5 text-center">
          <h3 className="mb-3">No reviews yet</h3>
          <p className="text-muted">You haven't reviewed any media yet. Head over to your library or discover page to start reviewing!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map(review => (
            <ReviewCard 
              key={`${review.media_type}-${review.media_id}`} 
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
        title="Delete Review"
        message="Are you sure you want to delete this review? This cannot be undone."
        confirmText="Delete"
        confirmStyle="danger"
      />
    </div>
  );
};

export default MyReviews;
