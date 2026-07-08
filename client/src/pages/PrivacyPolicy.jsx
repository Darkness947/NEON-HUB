import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container fade-in">
      <div className="container" style={{ maxWidth: '800px', padding: '3rem 0' }}>
        <h1 className="mb-4 text-center" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--color-text-primary)' }}>
          {t('privacy.title')}
        </h1>
        <p className="text-muted text-center mb-5">{t('privacy.lastUpdated')} {new Date().toLocaleDateString()}</p>
        
        <div className="card p-4 p-md-5" style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--border-neon)' }}>
          <section className="mb-4">
            <h4 className="text-accent-blue mb-3">{t('privacy.s1Title')}</h4>
            <p className="text-light" style={{ lineHeight: '1.7' }}>
              {t('privacy.s1Desc')}
            </p>
            <ul className="text-light" style={{ lineHeight: '1.7' }}>
              <li>{t('privacy.s1L1')}</li>
              <li>{t('privacy.s1L2')}</li>
              <li>{t('privacy.s1L3')}</li>
              <li>{t('privacy.s1L4')}</li>
            </ul>
          </section>

          <section className="mb-4">
            <h4 className="text-accent-blue mb-3">{t('privacy.s2Title')}</h4>
            <p className="text-light" style={{ lineHeight: '1.7' }}>
              {t('privacy.s2Desc')}
            </p>
            <ul className="text-light" style={{ lineHeight: '1.7' }}>
              <li>{t('privacy.s2L1')}</li>
              <li>{t('privacy.s2L2')}</li>
              <li>{t('privacy.s2L3')}</li>
              <li>{t('privacy.s2L4')}</li>
            </ul>
          </section>

          <section className="mb-4">
            <h4 className="text-accent-blue mb-3">{t('privacy.s3Title')}</h4>
            <p className="text-light" style={{ lineHeight: '1.7' }}>
              {t('privacy.s3Desc')}
            </p>
          </section>

          <section className="mb-4">
            <h4 className="text-accent-blue mb-3">{t('privacy.s4Title')}</h4>
            <p className="text-light" style={{ lineHeight: '1.7' }}>
              {t('privacy.s4Desc')}
            </p>
          </section>

          <section>
            <h4 className="text-accent-blue mb-3">{t('privacy.s5Title')}</h4>
            <p className="text-light" style={{ lineHeight: '1.7' }}>
              {t('privacy.s5Desc')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
