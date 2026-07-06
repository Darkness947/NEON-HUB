import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import libraryService from '../../services/libraryService';
import reviewService from '../../services/reviewService';
import dashboardService from '../../services/dashboardService';
import ReviewCard from '../../components/media/ReviewCard';
import FullPageLoader from '../../components/common/Loader';
import SkeletonDetail from '../../components/common/SkeletonDetail';
import GenreChart from '../../components/dashboard/GenreChart';
import defaultAvatar from '../../assets/images/default_avatar.png';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ movies: 0, series: 0, games: 0, total: 0 });
  const [recentReviews, setRecentReviews] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const [moviesRes, seriesRes, gamesRes, reviewsRes, genresData] = await Promise.all([
          libraryService.getLibrary('movies', '', 1),
          libraryService.getLibrary('series', '', 1),
          libraryService.getLibrary('games', '', 1),
          reviewService.getReviews(),
          dashboardService.getGenres()
        ]);

        if (!cancelled) {
          setStats({
            movies: moviesRes.total || 0,
            series: seriesRes.total || 0,
            games: gamesRes.total || 0,
            total: (moviesRes.total || 0) + (seriesRes.total || 0) + (gamesRes.total || 0),
          });
          setRecentReviews(reviewsRes.slice(0, 5)); // Show top 5 recent reviews
          setGenres(genresData);
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
      <h1 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Profile</h1>
      
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
            <p className="text-muted">Member since {new Date(user.created_at).getFullYear()}</p>
          </div>
        </div>

        {/* Stats Grid & Genres */}
        <div className="col-12 col-md-8 d-flex flex-column">
          <div className="row g-3 mb-3">
            <div className="col-6 col-sm-3">
              <div className="card p-3 text-center d-flex flex-column justify-content-center" style={{ backgroundColor: 'var(--color-bg-elevated)', border: 'none' }}>
                <h4 className="text-accent-blue fw-bold mb-1" style={{ fontSize: '1.8rem' }}>{stats.total}</h4>
                <span className="text-muted small text-uppercase fw-bold">Items</span>
              </div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="card p-3 text-center d-flex flex-column justify-content-center" style={{ backgroundColor: 'var(--color-bg-elevated)', border: 'none' }}>
                <h4 className="text-light fw-bold mb-1" style={{ fontSize: '1.8rem' }}>{stats.movies}</h4>
                <span className="text-muted small text-uppercase fw-bold">Movies</span>
              </div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="card p-3 text-center d-flex flex-column justify-content-center" style={{ backgroundColor: 'var(--color-bg-elevated)', border: 'none' }}>
                <h4 className="text-light fw-bold mb-1" style={{ fontSize: '1.8rem' }}>{stats.series}</h4>
                <span className="text-muted small text-uppercase fw-bold">Series</span>
              </div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="card p-3 text-center d-flex flex-column justify-content-center" style={{ backgroundColor: 'var(--color-bg-elevated)', border: 'none' }}>
                <h4 className="text-light fw-bold mb-1" style={{ fontSize: '1.8rem' }}>{stats.games}</h4>
                <span className="text-muted small text-uppercase fw-bold">Games</span>
              </div>
            </div>
          </div>
          
          <div className="card p-3 flex-grow-1" style={{ backgroundColor: 'var(--color-bg-elevated)', border: 'none' }}>
            <h4 className="text-muted small text-uppercase fw-bold mb-2">Top Genres</h4>
            <div style={{ height: '180px' }}>
              <GenreChart data={genres} />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <h3 className="mb-4" style={{ fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border-neon)', paddingBottom: '0.5rem' }}>Recent Reviews</h3>
          {isLoading ? (
            <SkeletonDetail />
          ) : recentReviews.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {recentReviews.map(review => (
                <ReviewCard 
                  key={`${review.media_type}-${review.media_id}`} 
                  review={review} 
                  onDelete={null} // Read only in public profile
                />
              ))}
            </div>
          ) : (
            <div className="card p-5 text-center">
              <p className="text-muted mb-0 fs-5">No reviews written yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
