import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import dashboardService from '../../services/dashboardService';
import ReviewCard from '../../components/media/ReviewCard';
import FullPageLoader from '../../components/common/Loader';
import SkeletonDetail from '../../components/common/SkeletonDetail';
import InsightsChart from '../../components/profile/InsightsChart';
import defaultAvatar from '../../assets/images/default_avatar.webp';
import { useTranslation } from 'react-i18next';

const StatValue = ({ value, isLoading, className }) => (
  isLoading ? (
    <span
      className="skeleton-shimmer d-inline-block mb-1"
      style={{ width: '48px', height: '1.8rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.06)' }}
      aria-hidden="true"
    />
  ) : (
    <h4 className={`${className} fw-bold mb-1`} style={{ fontSize: '1.8rem' }}>{value}</h4>
  )
);

const Profile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState({ movies: 0, series: 0, games: 0, total: 0 });
  const [recentReviews, setRecentReviews] = useState([]);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        // One request: counts + rating distribution + 5 latest rated/reviewed items
        const { counts, insights: insightsData, recentActivity } = await dashboardService.getProfileSummary();

        if (!cancelled) {
          setStats(counts);
          setRecentReviews(recentActivity);
          setInsights(insightsData);
        }
      } catch (error) {
        console.error('Failed to load profile data', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchProfileData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return <FullPageLoader />;

  const currentAvatar = user.avatar_url || defaultAvatar;

  return (
    <div className="page-container fade-in">
      <h1 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>{t('profile.title')}</h1>
      
      <div className="row g-4 mb-5">
        {/* User Card */}
        <div className="col-12 col-md-4">
          <div className="card text-center p-4 h-100" style={{ border: '1px solid var(--border-neon)' }}>
            <div 
              className="mx-auto mb-3 flex-shrink-0" 
              style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--color-accent-blue)' }}
            >
              <img 
                src={currentAvatar} 
                alt={user.username} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
              />
            </div>
            <h3 className="mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>{user.username}</h3>
            <p className="text-muted mb-2">{t('profile.memberSince')} {new Date(user.created_at).getFullYear()}</p>
            {user.bio && (
              <p className="text-light mt-3 mb-0" style={{ fontSize: '0.95rem', fontStyle: 'italic', wordBreak: 'break-word' }}>
                "{user.bio}"
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid & Genres */}
        <div className="col-12 col-md-8 d-flex flex-column">
          <div className="row g-3 mb-3">
            <div className="col-6 col-sm-3">
              <div className="card p-3 text-center d-flex flex-column justify-content-center" style={{ backgroundColor: 'var(--color-bg-elevated)', border: 'none' }}>
                <StatValue value={stats.total} isLoading={isLoading} className="text-accent-blue" />
                <span className="text-muted small text-uppercase fw-bold">{t('library.all')}</span>
              </div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="card p-3 text-center d-flex flex-column justify-content-center" style={{ backgroundColor: 'var(--color-bg-elevated)', border: 'none' }}>
                <StatValue value={stats.movies} isLoading={isLoading} className="text-light" />
                <span className="text-muted small text-uppercase fw-bold">{t('nav.movies')}</span>
              </div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="card p-3 text-center d-flex flex-column justify-content-center" style={{ backgroundColor: 'var(--color-bg-elevated)', border: 'none' }}>
                <StatValue value={stats.series} isLoading={isLoading} className="text-light" />
                <span className="text-muted small text-uppercase fw-bold">{t('nav.series')}</span>
              </div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="card p-3 text-center d-flex flex-column justify-content-center" style={{ backgroundColor: 'var(--color-bg-elevated)', border: 'none' }}>
                <StatValue value={stats.games} isLoading={isLoading} className="text-light" />
                <span className="text-muted small text-uppercase fw-bold">{t('nav.games')}</span>
              </div>
            </div>
          </div>
          
          <div className="card p-3 flex-grow-1" style={{ backgroundColor: 'var(--color-bg-elevated)', border: 'none' }}>
            <InsightsChart data={insights} />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <h3 className="mb-4" style={{ fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border-neon)', paddingBottom: '0.5rem' }}>{t('dashboard.recentActivity')}</h3>
          {isLoading ? (
            <SkeletonDetail />
          ) : recentReviews.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {recentReviews.map(review => (
                <ReviewCard 
                  key={`${review.media_type}-${review.db_id}`} 
                  review={review} 
                  onDelete={null} // Read only in public profile
                />
              ))}
            </div>
          ) : (
            <div className="card p-5 text-center">
              <p className="text-muted mb-0 fs-5">{t('reviews.noReviews')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
