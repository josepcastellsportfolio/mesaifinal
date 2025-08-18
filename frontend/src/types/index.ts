/**
 * Global type definitions for the application.
 * Defines interfaces and types used across components and services.
 */

// API Response Types
export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  detail?: string;
}

// Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'admin' | 'manager' | 'user';
  phone_number?: string;
  avatar?: string;
  bio?: string;
  is_active: boolean;
  date_joined: string;
  updated_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  date_of_birth?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  linkedin_profile?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

// Core Models Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent?: number;
  children?: Category[];
  full_path: string;
  image?: string;
  is_active: boolean;
  sort_order: number;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  category: Category;
  category_id?: number;
  price: string;
  cost?: string;
  stock_quantity: number;
  sku: string;
  barcode?: string;
  weight?: string;
  dimensions?: string;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  is_in_stock: boolean;
  profit_margin?: number;
  created_by: string;
  tags: Tag[];
  tag_ids?: number[];
  average_rating?: number;
  review_count: number;
  recent_reviews?: Review[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  product: number;
  product_name: string;
  user: string;
  user_name: string;
  rating: number;
  title: string;
  content: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_votes: number;
  star_display: string;
  created_at: string;
  updated_at: string;
}

// Form Types
export interface ProductFormData {
  name: string;
  description: string;
  short_description?: string;
  category_id: number;
  price: string;
  cost?: string;
  stock_quantity: number;
  sku: string;
  barcode?: string;
  weight?: string;
  dimensions?: string;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  tag_ids?: number[];
}

export interface ReviewFormData {
  rating: number;
  title: string;
  content: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface FilterState {
  search?: string;
  category?: number;
  tags?: number[];
  status?: string;
  is_featured?: boolean;
  price_min?: number;
  price_max?: number;
  ordering?: string;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export interface FormProps<T> extends BaseComponentProps {
  initialData?: Partial<T>;
  onSubmit: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

// Navigation Types
export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
  roles?: string[];
}

// Store Types
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
}

// Notification constants
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export const NOTIFICATION_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
  PERSISTENT: 0,
} as const;
