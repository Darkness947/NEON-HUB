import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import aiService from '../../services/aiService';
import FullPageLoader from '../../components/common/Loader';
import { useTranslation } from 'react-i18next';

const AiRecommendations = () => {
  const { mediaType } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await aiService.getRecommendations(mediaType);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to get recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [mediaType]);

  if (isLoading) {
    return (
      <div className="page-container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="text-muted fade-in" style={{ animation: 'pulse 1.5s infinite' }}>
          {t('ai.analyzingTaste', 'AI is analyzing your library...')}
        </h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container fade-in text-center">
        <h1 className="text-danger mb-4">Oops!</h1>
        <p className="text-muted mb-4">{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/library')}>
          {t('library.backToLibrary', 'Back to Library')}
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="page-container fade-in">
      <div className="hero-section mb-5 text-center p-5 rounded" style={{ background: 'linear-gradient(45deg, rgba(123,47,190,0.1), rgba(0,0,0,0.5))', border: '1px solid var(--border-neon)' }}>
        <h1 className="display-5 fw-bold mb-3" style={{ color: 'var(--color-accent-purple)' }}>
          {t('ai.yourRecommendations', 'Your Recommendations')}
        </h1>
        <p className="lead text-light mb-0" style={{ maxWidth: '800px', margin: '0 auto', fontStyle: 'italic' }}>
          "{data.taste_analysis}"
        </p>
      </div>

      <div className="row g-4 mb-5">
        {data.recommendations.map((rec, index) => (
          <div className="col-md-6 col-lg-4" key={index}>
            <div className="card h-100 bg-darker border-neon p-4 d-flex flex-column" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <h4 className="card-title fw-bold text-light mb-3">{rec.title}</h4>
              <p className="card-text text-muted flex-grow-1" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                {rec.reason}
              </p>
              
              {rec.similar_to && rec.similar_to.length > 0 && (
                <div className="mt-3 pt-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                  <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                    {t('ai.becauseYouLiked', 'Because you liked:')}
                  </small>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {rec.similar_to.map((sim, idx) => (
                      <span key={idx} className="badge bg-secondary rounded-pill fw-normal" style={{ backgroundColor: 'rgba(255,255,255,0.1) !important' }}>
                        {sim}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button className="btn btn-outline-light me-3 px-4 py-2" onClick={() => navigate('/library')} style={{ borderRadius: '25px' }}>
          {t('library.backToLibrary', 'Back to Library')}
        </button>
      </div>
    </div>
  );
};

export default AiRecommendations;
