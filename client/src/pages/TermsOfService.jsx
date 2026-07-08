import React from 'react';
import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container fade-in">
      <div className="container" style={{ maxWidth: '800px', padding: '3rem 0' }}>
        <h1 className="mb-4 text-center" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--color-text-primary)' }}>
          {t('terms.title')}
        </h1>
        <p className="text-muted text-center mb-5">{t('terms.lastUpdated')} {new Date().toLocaleDateString()}</p>
        
        <div className="card p-4 p-md-5" style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--border-neon)' }}>
          <section className="mb-4">
            <h4 className="text-accent-blue mb-3">{t('terms.s1Title')}</h4>
            <p className="text-light" style={{ lineHeight: '1.7' }}>
              {t('terms.s1Desc')}
            </p>
          </section>

          <section className="mb-4">
            <h4 className="text-accent-blue mb-3">{t('terms.s2Title')}</h4>
            <p className="text-light" style={{ lineHeight: '1.7' }}>
              {t('terms.s2Desc')}
            </p>
          </section>

          <section className="mb-4">
            <h4 className="text-accent-blue mb-3">{t('terms.s3Title')}</h4>
            <p className="text-light" style={{ lineHeight: '1.7' }}>
              {t('terms.s3Desc')}
            </p>
          </section>

          <section className="mb-4">
            <h4 className="text-accent-blue mb-3">{t('terms.s4Title')}</h4>
            <p className="text-light" style={{ lineHeight: '1.7' }}>
              {t('terms.s4Desc')}
            </p>
          </section>

          <section>
            <h4 className="text-accent-blue mb-3">{t('terms.s5Title')}</h4>
            <p className="text-light" style={{ lineHeight: '1.7' }}>
              {t('terms.s5Desc')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
