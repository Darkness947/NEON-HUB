import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import aiService from '../../services/aiService';
import { useTranslation } from 'react-i18next';

const AiComparison = () => {
  const { mediaType, mediaId1, mediaId2 } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadComparison = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await aiService.getComparison(mediaType, mediaId1, mediaId2);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to compare items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComparison();
  }, [mediaType, mediaId1, mediaId2]);

  if (isLoading) {
    return (
      <div className="page-container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="text-muted fade-in" style={{ animation: 'pulse 1.5s infinite' }}>
          {t('ai.analyzingComparison', 'AI is comparing selected items...')}
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
      <div className="text-center mb-5">
        <h1 className="display-6 fw-bold mb-4" style={{ color: 'var(--color-accent-purple)' }}>
          {t('ai.comparisonResults', 'Comparison Results')}
        </h1>
        
        <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap">
          <div className="text-center" style={{ width: '200px' }}>
            {data.media1.poster_url ? (
              <img src={data.media1.poster_url} alt={data.media1.title} className="img-fluid rounded shadow mb-3 border-neon" />
            ) : (
              <div className="bg-dark rounded d-flex align-items-center justify-content-center border-neon mb-3" style={{ height: '300px' }}>
                <span className="text-muted">{data.media1.title}</span>
              </div>
            )}
            <h5 className="fw-bold m-0">{data.media1.title}</h5>
          </div>
          
          <div className="mx-4 text-muted fw-bold display-5">
            VS
          </div>
          
          <div className="text-center" style={{ width: '200px' }}>
            {data.media2.poster_url ? (
              <img src={data.media2.poster_url} alt={data.media2.title} className="img-fluid rounded shadow mb-3 border-neon" />
            ) : (
              <div className="bg-dark rounded d-flex align-items-center justify-content-center border-neon mb-3" style={{ height: '300px' }}>
                <span className="text-muted">{data.media2.title}</span>
              </div>
            )}
            <h5 className="fw-bold m-0">{data.media2.title}</h5>
          </div>
        </div>
      </div>

      <div className="comparison-content mx-auto" style={{ maxWidth: '900px' }}>
        {data.categories.map((cat, idx) => (
          <div key={idx} className="card bg-darker border-neon mb-4">
            <div className="card-header border-bottom border-secondary p-3">
              <h5 className="m-0 text-center" style={{ color: 'var(--color-accent-purple)' }}>{cat.name}</h5>
            </div>
            <div className="card-body p-0">
              <div className="row g-0">
                <div className="col-md-6 p-4 border-end border-secondary">
                  <h6 className="fw-bold mb-3">{data.media1.title}</h6>
                  <p className="text-muted mb-0" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>{cat.media1_text}</p>
                </div>
                <div className="col-md-6 p-4">
                  <h6 className="fw-bold mb-3">{data.media2.title}</h6>
                  <p className="text-muted mb-0" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>{cat.media2_text}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="card h-100 bg-darker border-success p-4">
              <h5 className="text-success mb-3">{data.media1.title} {t('ai.strengths', 'Strengths')}</h5>
              <ul className="text-muted mb-0 pl-3">
                {data.media1.strengths.map((s, i) => <li key={i} className="mb-2">{s}</li>)}
              </ul>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100 bg-darker border-success p-4">
              <h5 className="text-success mb-3">{data.media2.title} {t('ai.strengths', 'Strengths')}</h5>
              <ul className="text-muted mb-0 pl-3">
                {data.media2.strengths.map((s, i) => <li key={i} className="mb-2">{s}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="card h-100 bg-darker border-danger p-4">
              <h5 className="text-danger mb-3">{data.media1.title} {t('ai.weaknesses', 'Weaknesses')}</h5>
              <ul className="text-muted mb-0 pl-3">
                {data.media1.weaknesses.map((w, i) => <li key={i} className="mb-2">{w}</li>)}
              </ul>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100 bg-darker border-danger p-4">
              <h5 className="text-danger mb-3">{data.media2.title} {t('ai.weaknesses', 'Weaknesses')}</h5>
              <ul className="text-muted mb-0 pl-3">
                {data.media2.weaknesses.map((w, i) => <li key={i} className="mb-2">{w}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="card bg-darker border-neon mb-5 p-4 text-center" style={{ background: 'linear-gradient(45deg, rgba(123,47,190,0.1), rgba(0,0,0,0.3))' }}>
          <h4 className="fw-bold mb-4" style={{ color: 'var(--color-accent-purple)' }}>{t('ai.finalVerdict', 'AI Final Verdict')}</h4>
          <p className="lead text-light mb-4" style={{ fontStyle: 'italic', lineHeight: '1.8' }}>
            "{data.verdict}"
          </p>
          <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <h6 className="text-uppercase fw-bold text-muted mb-2" style={{ letterSpacing: '1px' }}>{t('ai.whoShouldWatch', 'Who Should Watch It?')}</h6>
            <p className="text-light m-0">{data.who_should_watch}</p>
          </div>
        </div>

        <div className="text-center">
          <button className="btn btn-outline-light px-4 py-2" onClick={() => navigate('/library')} style={{ borderRadius: '25px' }}>
            {t('library.backToLibrary', 'Back to Library')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiComparison;
