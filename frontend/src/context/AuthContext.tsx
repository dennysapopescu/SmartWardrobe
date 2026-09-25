import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types/wardrobe';
import { authApi, getAuthToken } from '../api/wardrobeApi';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
  openAuthModal: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const existingToken = getAuthToken();
      if (existingToken) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
          setToken(existingToken);
        } catch {
          authApi.logout();
          setToken(null);
          setUser(null);
        }
      } else {
        // Auto-seed / login as demo user for frictionless portfolio reviewing
        try {
          const res = await authApi.loginDemo();
          setUser(res.user);
          setToken(res.token);
        } catch (e) {
          console.warn('Initial demo session initialization failed:', e);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password: pass });
      setUser(res.user);
      setToken(res.token);
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.register({ email, password: pass, fullName: name });
      setUser(res.user);
      setToken(res.token);
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    setIsLoading(true);
    try {
      const res = await authApi.loginDemo();
      setUser(res.user);
      setToken(res.token);
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setToken(null);
    setUser(null);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        loginDemo,
        logout,
        openAuthModal,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
