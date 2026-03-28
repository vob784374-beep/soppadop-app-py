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

export interface Resource {
  id: number;
  display_name: string | null;
  filename: string;
  original_name: string;
  file_type: 'image' | 'video' | 'document' | 'archive' | 'other';
  mime_type: string;
  size: number;
  cloudinary_url: string;
  cloudinary_public_id: string;
  resource_type: string;
  collection: string;
  folder: string;
  format: string | null;
  width: number | null;
  height: number | null;
  version: number | null;
  tags: string | null;
  description: string | null;
  download_count: number;
  uploaded_by: number;
  uploaded_by_user: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResources {
  resources: Resource[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ResourceStats {
  total_files: number;
  total_size: number;
  by_type: Record<string, number>;
  by_collection: Record<string, number>;
}

export interface ResourceCollection {
  name: string;
  count: number;
}

export interface ResourceFolder {
  name: string;
  file_count: number;
  total_size: number;
}

export interface CloudinaryAccount {
  plan: string;
  cloud_name: string;
  credits: { used: number; limit: number; used_percent: number };
  storage: { used_bytes: number; limit_bytes: number; used_percent: number };
  bandwidth: { used_bytes: number; limit_bytes: number; used_percent: number };
  transformations: { used: number; limit: number; used_percent: number };
  objects: { used: number; limit: number };
  requests: number;
  resources: number;
}
