import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <AppRouter />
      </LibraryProvider>
    </AuthProvider>
  );
}

export default App;
