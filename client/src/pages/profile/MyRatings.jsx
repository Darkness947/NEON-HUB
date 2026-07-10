import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import libraryService from '../../services/libraryService';
import ReviewCard from '../../components/media/ReviewCard';
import FullPageLoader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useTranslation } from 'react-i18next';

const MyRatings = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadRatings = async () => {
      try {
        setIsLoading(true);
        const data = await libraryService.getRatings();
        if (!cancelled) setRatings(data);
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

  if (isLoading) return <FullPageLoader />;

  return (
    <div className="page-container fade-in">
      <h1 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>{t('ratings.title')}</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!error && ratings.length === 0 ? (
        <EmptyState 
          title={t('ratings.noRatings')} 
          message={t('ratings.emptyMessage')} 
        />
      ) : (
        <div className="row g-4">
          {ratings.map((rating) => (
            <div key={`${rating.media_type}-${rating.db_id}`} className="col-12 col-md-6 col-lg-4">
              <ReviewCard review={rating} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRatings;
