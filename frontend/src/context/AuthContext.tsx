import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { setAuthFailureHandler } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const isAuthenticated = !!token;

  const logout = useCallback(() => setToken(null), []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    setAuthFailureHandler(logout);
    return () => setAuthFailureHandler(() => {});
  }, [logout]);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await axios.post(`${API_BASE}/api/login`, { email, password });
      if (res.data.success && res.data.token) {
        setToken(res.data.token);
        return null;
      }
      return res.data.error || 'Login gagal.';
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        return err.response.data.error;
      }
      return 'Tidak dapat terhubung ke server.';
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
