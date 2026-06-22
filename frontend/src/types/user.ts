export type UserRole = 'admin' | 'form_builder' | 'respondent';

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  created_at: string;
  created_by?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
  tenant: Tenant;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenant_id: string;
}
