import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import FullPageLoader from '../components/common/Loader';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: attempt silent token refresh to restore session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { accessToken, user: userData } = await authService.refreshToken();
        window.__accessToken = accessToken;
        setUser(userData);
      } catch {
        // No active session — stay logged out
        window.__accessToken = null;
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const { accessToken, user: userData } = await authService.login(email, password);
    window.__accessToken = accessToken;
    setUser(userData);
  };

  const register = async (username, email, password) => {
    await authService.register(username, email, password);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Logout API might fail if token is already expired — that's fine
    }
    window.__accessToken = null;
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // Block render until we know if there's an active session
  if (isLoading) return <FullPageLoader />;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
