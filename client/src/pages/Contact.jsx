import mainLogo from '../assets/images/main_logo.png';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  const contactLinks = [
    {
      platform: 'Email',
      icon: 'bi-envelope-fill',
      link: 'mailto:husdfdf@gmail.com',
      text: 'husdfdf@gmail.com',
      color: '#EA4335'
    },
    {
      platform: 'GitHub',
      icon: 'bi-github',
      link: 'https://github.com/Darkness947',
      text: 'Darkness947',
      color: '#ffffff'
    },
    {
      platform: 'LinkedIn',
      icon: 'bi-linkedin',
      link: 'https://www.linkedin.com/in/hussain-alhumaidi-6726b334a',
      text: 'Hussain Alhumaidi',
      color: '#0A66C2'
    },
    {
      platform: 'Portfolio',
      icon: 'bi-globe',
      link: 'https://hussain-portfolio-dev.netlify.app',
      text: 'hussain-portfolio-dev',
      color: '#0dcaf0'
    }
  ];

  return (
    <div className="container py-5" style={{ minHeight: '80vh' }}>
      <div className="text-center mb-5 fade-in">
        <img 
          src={mainLogo} 
          alt="Neon Hub Logo" 
          className="logo-animate"
          style={{ maxWidth: '450px', width: '100%', height: 'auto', marginBottom: '2rem' }} 
        />
        <h1 className="fw-bold mb-3">{t('contact.title')}</h1>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
          {t('contact.desc')}
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        {contactLinks.map((contact, idx) => (
          <div className="col-md-6 col-lg-3 d-flex fade-in" key={idx} style={{ animationDelay: `${idx * 0.1}s` }}>
            <div 
              className="card w-100 contact-card" 
              style={{ cursor: 'pointer' }}
              onClick={() => window.open(contact.link, '_blank', 'noopener,noreferrer')}
            >
              <div className="card-body d-flex flex-column align-items-center text-center p-4">
                <div 
                  className="mb-3 d-flex align-items-center justify-content-center rounded-circle contact-icon-wrapper"
                  style={{ 
                    width: '64px', 
                    height: '64px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: contact.color 
                  }}
                >
                  <i className={`bi ${contact.icon}`} style={{ fontSize: '2rem' }}></i>
                </div>
                <h5 className="fw-bold mb-2">{contact.platform}</h5>
                <span className="text-muted small text-break">{contact.text}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contact;
