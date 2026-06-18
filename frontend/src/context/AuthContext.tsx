import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Tenant, AuthResponse } from '../types/user';
import authService from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedTenant = localStorage.getItem('tenant');
    
    if (storedUser && storedTenant) {
      try {
        setUser(JSON.parse(storedUser));
        setTenant(JSON.parse(storedTenant));
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        authService.logout();
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authService.login(email, password);
      setUser(response.user);
      setTenant(response.tenant);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setTenant(null);
  };

  const value: AuthContextType = {
    user,
    tenant,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
