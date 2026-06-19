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
  const request: LoginRequest = {
    email,
    password,
    tenant_id: '00000000-0000-0000-0000-000000000001',
  };

  // Raw shape the backend actually returns
  const raw = await apiClient.login(request) as any;

  // Map flat backend fields to the nested AuthResponse shape the app expects
  const response: AuthResponse = {
    access_token: raw.token,
    token_type: 'Bearer',
    expires_in: 86400,
    user: {
      id: raw.user_id,
      tenant_id: raw.tenant_id,
      email: raw.email,
      role: raw.role,
      created_at: '',
    },
    tenant: {
      id: raw.tenant_id,
      name: '',
      created_at: '',
    },
  };

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
