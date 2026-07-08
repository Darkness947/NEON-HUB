import { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRouter from './routes/AppRouter';
import './i18n';
import { useTranslation } from 'react-i18next';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const isRtl = i18n.language === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language || 'en';
    document.documentElement.setAttribute('data-bs-theme', 'dark');

    let rtlLink = document.getElementById('bootstrap-rtl');
    if (isRtl) {
      if (!rtlLink) {
        rtlLink = document.createElement('link');
        rtlLink.id = 'bootstrap-rtl';
        rtlLink.rel = 'stylesheet';
        rtlLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css';
        document.head.insertBefore(rtlLink, document.head.firstChild);
      }
    } else {
      if (rtlLink) {
        rtlLink.remove();
      }
    }
  }, [i18n.language]);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <LibraryProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: 'var(--color-bg-elevated)',
                color: '#fff',
                border: '1px solid var(--color-bg-deep)',
              },
            }} 
          />
          <AppRouter />
        </LibraryProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
