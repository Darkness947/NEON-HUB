import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import dashboardService from '../../services/dashboardService';
import StatsCard from '../../components/dashboard/StatsCard';
import ProgressBar from '../../components/dashboard/ProgressBar';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import GenreChart from '../../components/dashboard/GenreChart';

const Dashboard = () => {
  const { user } = useAuth();
  
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
        Welcome back, <span className="text-accent-purple">{user?.username}</span>
      </h1>

      {/* Top Row: Stats Cards */}
      <div className="row g-4 mb-4">
        <StatsCard 
          label="Total Tracked" 
          count={totalTracked} 
          icon="🎬" 
          color="var(--color-accent-purple)" 
        />
        <StatsCard 
          label="Avg Rating" 
          count={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'} 
          icon="⭐" 
          color="var(--color-accent-amber)" 
        />
        <StatsCard 
          label="Hours Played" 
          count={stats.totalHoursPlayed > 0 ? Math.round(stats.totalHoursPlayed) : 0} 
          icon="🎮" 
          color="var(--color-accent-blue)" 
        />
        <StatsCard 
          label="Completion %" 
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
              Completion Progress
            </h3>
            <div className="d-flex justify-content-around align-items-center h-100 flex-wrap">
              <ProgressBar percentage={moviesPercent} color="var(--color-accent-purple)" label="Movies" />
              <ProgressBar percentage={seriesPercent} color="var(--color-accent-blue)" label="Series" />
              <ProgressBar percentage={gamesPercent} color="var(--color-accent-amber)" label="Games" />
            </div>
          </div>
        </div>
        
        {/* Genre Chart */}
        <div className="col-12 col-lg-7">
          <div className="card p-4 h-100">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              Top Genres (Recent)
            </h3>
            <GenreChart data={genres} />
          </div>
        </div>
      </div>

      {/* Bottom Row: Activity Feed */}
      <div className="card p-4 mt-4">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
          Recent Activity
        </h3>
        <ActivityFeed activities={activity} />
      </div>
    </div>
  );
};

export default Dashboard;
