import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
