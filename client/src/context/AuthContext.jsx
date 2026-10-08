import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('consentiq_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('consentiq_token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('consentiq_token');
        localStorage.removeItem('consentiq_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('consentiq_token', newToken);
        localStorage.setItem('consentiq_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('consentiq_token', newToken);
        localStorage.setItem('consentiq_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (err) {
      console.warn('Logout API notification error:', err);
    } finally {
      localStorage.removeItem('consentiq_token');
      localStorage.removeItem('consentiq_user');
      setUser(null);
      setToken(null);
      window.location.href = '/login';
    }
  };

  const getDashboardRoute = (role) => {
    switch (role) {
      case 'DOCTOR':
        return '/doctor/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      case 'AUDITOR':
        return '/auditor/dashboard';
      case 'PATIENT':
      default:
        return '/patient/dashboard';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        getDashboardRoute
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
