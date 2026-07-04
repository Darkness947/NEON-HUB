import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
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
  );
}

export default App;
