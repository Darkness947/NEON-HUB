import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import dashboardService from '../../services/dashboardService';
import StatsCard from '../../components/dashboard/StatsCard';
import ProgressBar from '../../components/dashboard/ProgressBar';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import GenreChart from '../../components/dashboard/GenreChart';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const [statsData, activityData, genresData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getActivity(),
          dashboardService.getGenres()
        ]);
        
        if (!cancelled) {
          setStats(statsData);
          setActivity(activityData);
          setGenres(genresData);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    
    loadDashboard();
    return () => { cancelled = true; };
  }, []);

  if (isLoading) {
    return (
      <div className="page-container d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-accent-purple" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container fade-in">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  // Calculate percentages
  const calcPercent = (completed, total) => total > 0 ? (completed / total) * 100 : 0;
  const moviesPercent = calcPercent(stats.moviesCompleted, stats.totalMovies);
  const seriesPercent = calcPercent(stats.seriesCompleted, stats.totalSeries);
  const gamesPercent = calcPercent(stats.gamesCompleted, stats.totalGames);
  const totalTracked = stats.totalMovies + stats.totalSeries + stats.totalGames;

  return (
    <div className="page-container fade-in">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 'var(--spacing-lg)' }}>
        {t('dashboard.welcome')}, <span className="text-accent-purple">{user?.username}</span>
      </h1>

      {/* Top Row: Stats Cards */}
      <div className="row g-4 mb-4">
        <StatsCard 
          label={t('dashboard.totalTracked')} 
          count={totalTracked} 
          icon="🎬" 
          color="var(--color-accent-purple)" 
        />
        <StatsCard 
          label={t('dashboard.avgRating')} 
          count={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'} 
          icon="⭐" 
          color="var(--color-accent-amber)" 
        />
        <StatsCard 
          label={t('dashboard.hoursPlayed')} 
          count={stats.totalHoursPlayed > 0 ? Math.round(stats.totalHoursPlayed) : 0} 
          icon="🎮" 
          color="var(--color-accent-blue)" 
        />
        <StatsCard 
          label={t('dashboard.completionPct')} 
          count={totalTracked > 0 ? Math.round(((stats.moviesCompleted + stats.seriesCompleted + stats.gamesCompleted) / totalTracked) * 100) + '%' : '0%'} 
          icon="✅" 
          color="var(--color-success)" 
        />
      </div>

      {/* Middle Row: Progress Rings & Genre Chart */}
      <div className="row g-4 mb-4">
        {/* Progress Rings */}
        <div className="col-12 col-lg-5">
          <div className="card p-4 h-100">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              {t('dashboard.completionProgress')}
            </h3>
            <div className="d-flex justify-content-around align-items-center h-100 flex-wrap">
              <ProgressBar percentage={moviesPercent} color="var(--color-accent-purple)" label={t('nav.movies')} />
              <ProgressBar percentage={seriesPercent} color="var(--color-accent-blue)" label={t('nav.series')} />
              <ProgressBar percentage={gamesPercent} color="var(--color-accent-amber)" label={t('nav.games')} />
            </div>
          </div>
        </div>
        
        {/* Genre Chart */}
        <div className="col-12 col-lg-7">
          <div className="card p-4 h-100">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              {t('dashboard.topGenres')}
            </h3>
            <GenreChart data={genres} />
          </div>
        </div>
      </div>

      {/* Bottom Row: Activity Feed */}
      <div className="card p-4 mt-4">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
          {t('dashboard.recentActivity')}
        </h3>
        <ActivityFeed activities={activity} />
      </div>
    </div>
  );
};

export default Dashboard;
