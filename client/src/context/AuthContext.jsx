import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

// Retry helper with exponential backoff (2s, 4s, 8s)
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 2000) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isLastAttempt = attempt === maxRetries;
      // Don't retry on auth errors (401/403) — only on network/timeout errors
      const isAuthError = err?.response?.status >= 400 && err?.response?.status < 500;
      if (isLastAttempt || isAuthError) throw err;

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: attempt silent token refresh to restore session (with retry)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const result = await retryWithBackoff(() => authService.refreshToken());
        window.__accessToken = result.accessToken;
        setUser(result.user);
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

  // NON-BLOCKING: render children immediately while auth resolves in background.
  // Protected routes will show their own loader via ProtectedRoute.
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
