import { apiClient } from './api';
import { LoginRequest, AuthResponse } from '../types/user';

export interface AuthService {
  login(email: string, password: string): Promise<AuthResponse>;
  logout(): void;
  getStoredToken(): string | null;
  isAuthenticated(): boolean;
}

const authService: AuthService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const request: LoginRequest = { email, password };
    const response = await apiClient.login(request);
    
    // Store token and user info
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('tenant', JSON.stringify(response.tenant));
    
    return response;
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
  },

  getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  },
};

export default authService;
