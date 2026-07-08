import React from 'react';
import { formatDate } from '../../utils/formatDate';
import { useTranslation } from 'react-i18next';

const getActionDetails = (action, mediaType, t) => {
  if (action === 'added_movie' || action === 'added_series' || action === 'added_game' || action === 'tracked_episode') {
    return { icon: '➕', text: t('dashboard.activityAdded'), color: 'var(--color-accent-purple)' };
  }
  if (action === 'removed_movie' || action === 'removed_series' || action === 'removed_game') {
    return { icon: '➖', text: t('dashboard.activityRemoved'), color: 'var(--color-danger)' };
  }
  if (action === 'updated_movie' || action === 'updated_series' || action === 'updated_game' || action === 'updated_episode') {
    return { icon: '🔄', text: t('dashboard.activityUpdated'), color: 'var(--color-accent-blue)' };
  }
  return { icon: '📝', text: t('dashboard.activityDefault'), color: 'var(--color-text-secondary)' };
};

const ActivityFeed = ({ activities }) => {
  const { t } = useTranslation();

  if (!activities || activities.length === 0) {
    return (
      <div className="text-muted text-center py-4">
        {t('dashboard.noActivity')}
      </div>
    );
  }

  return (
    <div className="activity-feed">
      {activities.map((item) => {
        const details = getActionDetails(item.action, item.media_type, t);
        
        return (
          <div key={item.id} className="d-flex align-items-start mb-4 fade-in">
            {/* Icon */}
            <div 
              className="d-flex justify-content-center align-items-center rounded-circle flex-shrink-0"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--color-bg-elevated)',
                border: `2px solid ${details.color}`,
                fontSize: '1.2rem',
                marginRight: '1rem',
                zIndex: 1
              }}
            >
              {details.icon}
            </div>
            
            {/* Content */}
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-baseline mb-1">
                <span className="fw-bold text-light" style={{ fontSize: '0.95rem' }}>
                  {details.text}
                </span>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {formatDate(item.created_at)}
                </span>
              </div>
              
              <div 
                className="card p-2 d-flex flex-row align-items-center"
                style={{ 
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: 'none',
                  marginTop: '0.5rem'
                }}
              >
                {item.media_poster && (
                  <img 
                    src={item.media_poster} 
                    alt={item.media_title}
                    style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginRight: '1rem' }}
                  />
                )}
                <div className="d-flex flex-column">
                  <span className="text-light fw-semibold" style={{ fontSize: '0.95rem' }}>
                    {item.media_title}
                  </span>
                  <span className="text-muted text-capitalize" style={{ fontSize: '0.8rem' }}>
                    {t(`nav.${item.media_type === 'movie' ? 'movies' : item.media_type === 'game' ? 'games' : 'series'}`)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;
