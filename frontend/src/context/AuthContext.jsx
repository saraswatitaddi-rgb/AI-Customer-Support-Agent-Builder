import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, setAuthToken, getAuthToken } from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [agent, setAgent] = useState(null);
  const [token, setTokenState] = useState(getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  // Check existing token on initial mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiRequest('/api/auth/me');
        if (data.success && data.user) {
          setUser(data.user);
          setAgent(data.agent);
        } else {
          setAuthToken(null);
          setTokenState(null);
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        setAuthToken(null);
        setTokenState(null);
        setUser(null);
        setAgent(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      setAuthToken(data.token);
      setTokenState(data.token);
      setUser(data.user);

      // Fetch user's agent details
      try {
        const meData = await apiRequest('/api/auth/me');
        if (meData.agent) setAgent(meData.agent);
      } catch {
        // Non-blocking
      }
    }

    return data;
  };

  const register = async (name, email, password) => {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (data.token) {
      setAuthToken(data.token);
      setTokenState(data.token);
      setUser(data.user);

      try {
        const meData = await apiRequest('/api/auth/me');
        if (meData.agent) setAgent(meData.agent);
      } catch {
        // Non-blocking
      }
    }

    return data;
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      setAuthToken(null);
      setTokenState(null);
      setUser(null);
      setAgent(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        agent,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        setUser,
        setAgent,
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
