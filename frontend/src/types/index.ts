export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  is_super_admin: boolean;
  permissions?: Permission[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: Role;
  is_active: boolean;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  role: 'admin' | 'manager' | 'client';
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface BackupLog {
  id: number;
  filename: string;
  version: number;
  action: 'create' | 'restore' | 'delete' | 'cleanup';
  size: number;
  status: 'success' | 'failed';
  error_message: string | null;
  created_by: number;
  created_by_user: string;
  created_at: string;
}

export interface BackupFile {
  filename: string;
  size: number;
  created_at: string;
  created_by: string;
}
