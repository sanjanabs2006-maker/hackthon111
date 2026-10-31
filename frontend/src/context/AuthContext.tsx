import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  district?: string;
  taluk?: string;
  role: 'farmer' | 'admin' | 'officer';
  language?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    phone: string,
    language: string,
    district?: string,
    taluk?: string
  ) => Promise<void>;
  loginDemo: (role?: 'farmer' | 'admin') => Promise<void>;
  logout: () => void;
}

export const DEFAULT_FARMER: User = {
  id: 'farmer-shivamogga-1',
  name: 'Suresh Gowda',
  email: 'suresh.farmer@malnad.in',
  phone: '9845012345',
  role: 'farmer',
  language: 'kn',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => DEFAULT_FARMER);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('krishi_access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('krishi_access_token');
      if (!storedToken) {
        setUser(DEFAULT_FARMER);
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
        } else {
          setUser(DEFAULT_FARMER);
        }
      } catch (err) {
        setUser(DEFAULT_FARMER);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await api.post('/auth/login', { 
      identifier: identifier.trim(), 
      email: identifier.trim(), 
      password 
    });
    if (res.data.success) {
      const { access_token, user: userData } = res.data;
      localStorage.setItem('krishi_access_token', access_token);
      setToken(access_token);
      setUser(userData);
    } else {
      throw new Error(res.data.message || 'Login failed');
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone: string,
    language: string,
    district?: string,
    taluk?: string
  ) => {
    const res = await api.post('/auth/register', { 
      name, 
      email, 
      password, 
      phone, 
      language,
      district,
      taluk 
    });
    if (res.data.success) {
      const { access_token, user: userData } = res.data;
      localStorage.setItem('krishi_access_token', access_token);
      setToken(access_token);
      setUser(userData);
    } else {
      throw new Error(res.data.message || 'Registration failed');
    }
  };

  const loginDemo = async (role: 'farmer' | 'admin' = 'farmer') => {
    // Demo auto-registration / login
    const email = role === 'admin' ? 'admin@krishimitra.karnataka.gov.in' : 'suresh.farmer@malnad.in';
    const password = 'Password@123';
    try {
      await login(email, password);
    } catch {
      // Register demo user
      await register(
        role === 'admin' ? 'Shri Ramesh Kumar (Director Agr)' : 'Suresh Gowda',
        email,
        password,
        '9845012345',
        'kn'
      );
    }
  };

  const logout = () => {
    localStorage.removeItem('krishi_access_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginDemo,
        logout,
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

