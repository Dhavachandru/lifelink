import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phoneNumber?: string) => Promise<void>;
  logout: () => void;
  loginDemo: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lifelink_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('lifelink_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleAuthSuccess = (data: AuthResponse) => {
    setToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem('lifelink_token', data.accessToken);
    localStorage.setItem('lifelink_refresh_token', data.refreshToken);
    localStorage.setItem('lifelink_user', JSON.stringify(data.user));
  };

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    handleAuthSuccess(data);
  };

  const register = async (email: string, password: string, fullName: string, phoneNumber?: string) => {
    const data = await authApi.register(email, password, fullName, phoneNumber);
    handleAuthSuccess(data);
  };

  const loginDemo = async () => {
    await login('driver@lifelink.os', 'Lifelink123!');
  };

  const logout = () => {
    try {
      authApi.logout();
    } catch (e) {
      // Best effort
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('lifelink_token');
    localStorage.removeItem('lifelink_refresh_token');
    localStorage.removeItem('lifelink_user');
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      localStorage.setItem('lifelink_user', JSON.stringify(profile));
    } catch (err) {
      console.warn('Failed to refresh profile', err);
    }
  };

  useEffect(() => {
    const handleInvalidAuth = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('lifelink_auth_invalidated', handleInvalidAuth);

    if (token) {
      refreshProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    return () => {
      window.removeEventListener('lifelink_auth_invalidated', handleInvalidAuth);
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        loginDemo,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
