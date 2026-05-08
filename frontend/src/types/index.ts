export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string;
  created_at?: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  is_super_admin: boolean;
  permissions?: Permission[];
  users?: Array<{ username?: string }>;
  user_count?: number;
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
  attributes?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface PolicyRuleCondition {
  user?: Record<string, string>;
  resource?: Record<string, string>;
  environment?: Record<string, string>;
}

export interface PolicyRule {
  id: number;
  name: string;
  description: string;
  priority: number;
  effect: 'allow' | 'deny';
  actions: string[];
  resources: string[];
  conditions: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PolicyRulesResponse {
  policies: PolicyRule[];
  total: number;
}

export interface UserAttribute {
  id: number;
  user_id: number;
  attr_key: string;
  attr_value: string;
  created_at: string;
}

export interface ResourceAttribute {
  id: number;
  resource_type: string;
  resource_id: number;
  attr_key: string;
  attr_value: string;
  created_at: string;
}

export interface PermissionCheck {
  action: string;
  resource: string;
  resourceId?: number;
  context?: Record<string, unknown>;
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

export interface SectionContent {
  id: number;
  section_id: number;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  video_url: string | null;
  link_url: string | null;
  tags: string | null;
  author: string | null;
  sort_order: number;
  is_visible: boolean;
  content_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SectionEffects {
  entry_effect: string;
  image_effect: string;
  text_effect: string;
  card_effect: string;
  bg_effect: string;
  auto_effect: string;
}

export interface PageSection {
  id: number;
  title: string;
  section_type: string;
  description: string | null;
  cover_image: string | null;
  sort_order: number;
  is_visible: boolean;
  status: 'draft' | 'published';
  layout: string;
  max_items: number;
  background_color: string | null;
  template_group: string | null;
  group_order: number;
  section_effects: SectionEffects | null;
  created_by: number;
  created_by_user: string | null;
  created_at: string;
  updated_at: string;
  contents?: SectionContent[];
  content_count?: number;
}

export interface PaginatedSections {
  sections: PageSection[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface PaginatedContents {
  section: PageSection;
  contents: SectionContent[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface TemplateContent {
  title?: string;
  subtitle?: string;
  body?: string;
  image_url?: string;
  video_url?: string;
  link_url?: string;
  tags?: string;
  author?: string;
  sort_order: number;
}

export interface Template {
  id: string
  type: 'section' | 'page'
  name: string
  description: string
  // section templates
  section_type?: string
  layout?: string
  contents?: TemplateContent[]
  // page templates
  sections?: {
    title: string
    section_type: string
    layout: string
    description?: string
    contents: TemplateContent[]
  }[]
}

export interface TemplateData {
  section_templates: Template[]
  page_templates: Template[]
}

export interface SectionOverviewTab {
  label: string
  count: number
  sections: PageSection[]
}

export interface SectionOverviewSummary {
  total: number
  published: number
  draft: number
  visible: number
  hidden: number
  displayed: number
}

export interface SectionOverview {
  tabs: {
    published: SectionOverviewTab
    draft: SectionOverviewTab
    all: SectionOverviewTab
  }
  summary: SectionOverviewSummary
}

export interface SectionGroupInfo {
  group: string | null
  is_template: boolean
  total: number
  published: number
  draft: number
  visible: number
  hidden: number
  displayed: number
  overall_status: 'published' | 'draft' | 'mixed'
  sections: PageSection[]
}


