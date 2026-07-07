import { useState, useEffect } from 'react';
import mediaService from '../../services/mediaService';
import libraryService from '../../services/libraryService';
import InlineRating from './InlineRating';
import ReviewModal from './ReviewModal';
import FullPageLoader from '../common/Loader';
import { toast } from 'react-hot-toast';

const EpisodeGuide = ({ seriesId, seasons, userEpisodes }) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trackedEpisodes, setTrackedEpisodes] = useState(userEpisodes || []);
  const [reviewModalData, setReviewModalData] = useState(null);

  // Validate and find the first non-specials season as default
  useEffect(() => {
    if (seasons && seasons.length > 0) {
      const regularSeasons = seasons.filter(s => s.season_number > 0);
      if (regularSeasons.length > 0) {
        setSelectedSeason(regularSeasons[0].season_number);
      }
    }
  }, [seasons]);

  useEffect(() => {
    let cancelled = false;
    const fetchEpisodes = async () => {
      try {
        setIsLoading(true);
        const data = await mediaService.getSeriesSeason(seriesId, selectedSeason);
        if (!cancelled) setEpisodes(data.episodes || []);
      } catch (err) {
        if (!cancelled) toast.error('Failed to load episodes');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    if (seriesId && selectedSeason) {
      fetchEpisodes();
    }

    return () => { cancelled = true; };
  }, [seriesId, selectedSeason]);

  const getEpisodeStatus = (seasonNum, episodeNum) => {
    return trackedEpisodes.find(
      e => e.season_number === seasonNum && e.episode_number === episodeNum
    );
  };

  const handleToggleWatched = async (episode) => {
    try {
      const current = getEpisodeStatus(episode.season_number, episode.episode_number);
      if (current) {
        await libraryService.removeEpisode(seriesId, episode.season_number, episode.episode_number);
        setTrackedEpisodes(prev => prev.filter(e => !(e.season_number === episode.season_number && e.episode_number === episode.episode_number)));
      } else {
        const added = await libraryService.trackEpisode(seriesId, episode.season_number, episode.episode_number, 'watched');
        setTrackedEpisodes(prev => [...prev, added]);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update episode');
    }
  };

  const handleReviewSave = async (data) => {
    try {
      const current = getEpisodeStatus(reviewModalData.season_number, reviewModalData.episode_number);
      let updated;
      if (current) {
        updated = await libraryService.updateEpisode(seriesId, reviewModalData.season_number, reviewModalData.episode_number, data);
        setTrackedEpisodes(prev => prev.map(e => (e.season_number === updated.season_number && e.episode_number === updated.episode_number) ? updated : e));
      } else {
        updated = await libraryService.trackEpisode(seriesId, reviewModalData.season_number, reviewModalData.episode_number, 'watched');
        updated = await libraryService.updateEpisode(seriesId, reviewModalData.season_number, reviewModalData.episode_number, data);
        setTrackedEpisodes(prev => [...prev, updated]);
      }
      setReviewModalData(null);
      toast.success('Review saved');
    } catch (error) {
      toast.error(error.message || 'Failed to save review');
    }
  };

  const regularSeasons = seasons?.filter(s => s.season_number > 0) || [];

  return (
    <div className="episode-guide">
      <div className="d-flex align-items-center mb-4 gap-3">
        <h3 className="mb-0">Episode Guide</h3>
        <select 
          className="form-select form-select-sm" 
          style={{ width: 'auto', backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-primary)', borderColor: 'var(--border-neon)' }}
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(Number(e.target.value))}
        >
          {regularSeasons.map(s => (
            <option key={s.id} value={s.season_number}>
              Season {s.season_number}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="p-5 text-center"><span className="spinner-border text-primary" /></div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {episodes.map(episode => {
            const status = getEpisodeStatus(episode.season_number, episode.episode_number);
            const isWatched = !!status;
            return (
              <div key={episode.id} className="card p-3" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--border-neon)', borderRadius: 'var(--radius-md)' }}>
                <div className="d-flex flex-column flex-md-row gap-3">
                  {episode.still_url ? (
                    <img src={episode.still_url} alt={episode.name} style={{ width: '150px', height: '84px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  ) : (
                    <div style={{ width: '150px', height: '84px', backgroundColor: 'var(--color-bg-deep)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>No Image</span>
                    </div>
                  )}
                  
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h5 className="mb-0">
                        {episode.episode_number}. {episode.name}
                      </h5>
                      <button 
                        className={`btn btn-sm ${isWatched ? 'btn-success' : 'btn-outline-secondary'}`}
                        onClick={() => handleToggleWatched(episode)}
                        style={{ borderRadius: '20px', fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}
                      >
                        {isWatched ? '✓ Watched' : 'Mark Watched'}
                      </button>
                    </div>
                    <div className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                      {episode.air_date} • {episode.runtime ? `${episode.runtime} min` : 'N/A'}
                    </div>
                    <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
                      {episode.overview || 'No description available.'}
                    </p>
                    
                    <div className="d-flex align-items-center justify-content-between pt-2 border-top" style={{ borderColor: 'var(--border-neon) !important' }}>
                      <InlineRating 
                        mediaType="episode"
                        mediaId={seriesId}
                        seasonNumber={episode.season_number}
                        episodeNumber={episode.episode_number}
                        initialRating={status?.rating}
                        onRatingChange={(newRating) => {
                          setTrackedEpisodes(prev => {
                            const exists = prev.find(e => e.season_number === episode.season_number && e.episode_number === episode.episode_number);
                            if (exists) {
                              return prev.map(e => (e.season_number === episode.season_number && e.episode_number === episode.episode_number) ? { ...e, rating: newRating } : e);
                            } else {
                              return [...prev, { season_number: episode.season_number, episode_number: episode.episode_number, status: 'watched', rating: newRating }];
                            }
                          });
                        }}
                      />
                      <button 
                        className="btn btn-link text-primary p-0" 
                        style={{ textDecoration: 'none', fontSize: '0.9rem' }}
                        onClick={() => setReviewModalData(episode)}
                      >
                        {status?.review ? 'Edit Review' : 'Write Review'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewModalData && (
        <ReviewModal
          isOpen={true}
          onClose={() => setReviewModalData(null)}
          onSave={handleReviewSave}
          initialData={getEpisodeStatus(reviewModalData.season_number, reviewModalData.episode_number) || { rating: null, review: '' }}
          mediaTitle={`S${reviewModalData.season_number}E${reviewModalData.episode_number}: ${reviewModalData.name}`}
        />
      )}
    </div>
  );
};

export default EpisodeGuide;
