export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
/**
 * Application constants and configuration values.
 * Centralizes all constant values used throughout the application.
 */

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login/',
  REFRESH: '/auth/refresh/',
  VERIFY: '/auth/verify/',
  
  // Users
  USERS: '/users/',
  USER_REGISTER: '/users/register/',
  USER_ME: '/users/me/',
  USER_PROFILE: '/users/update_profile/',
  
  // Core
  CATEGORIES: '/categories/',
  PRODUCTS: '/products/',
  TAGS: '/tags/',
  REVIEWS: '/reviews/',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
} as const;

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  API_TEST: '/api-test',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  PRODUCT_CREATE: '/products/create',
  PRODUCT_EDIT: '/products/:slug/edit',
  
  // Categories
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: '/categories/:slug',
  CATEGORY_CREATE: '/categories/create',
  CATEGORY_EDIT: '/categories/:slug/edit',
  
  // Users (Admin)
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  
  // Settings
  SETTINGS: '/settings',
} as const;

// UI Constants
export const THEME = {
  COLORS: {
    PRIMARY: '#0078d4',
    SECONDARY: '#6c757d',
    SUCCESS: '#28a745',
    DANGER: '#dc3545',
    WARNING: '#ffc107',
    INFO: '#17a2b8',
    LIGHT: '#f8f9fa',
    DARK: '#343a40',
  },
  BREAKPOINTS: {
    XS: '0px',
    SM: '576px',
    MD: '768px',
    LG: '992px',
    XL: '1200px',
    XXL: '1400px',
  },
  SPACING: {
    XS: '0.25rem',
    SM: '0.5rem',
    MD: '1rem',
    LG: '1.5rem',
    XL: '3rem',
  },
} as const;

// Form Validation
export const VALIDATION = {
  EMAIL_REGEX: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE_REGEX: /^\+?1?\d{9,15}$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 150,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_VISIBLE_PAGES: 5,
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

// Product Status
export const PRODUCT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Default notification duration (ms)
export const NOTIFICATION_DURATION = {
  SUCCESS: 4000,
  ERROR: 6000,
  WARNING: 5000,
  INFO: 4000,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  TIME_ONLY: 'HH:mm',
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain', 'application/msword'],
} as const;

// Navigation Items Configuration
export const NAVIGATION_ITEMS = [
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: 'dashboard',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.USER],
  },
  {
    label: 'API Test',
    path: ROUTES.API_TEST,
    icon: 'api',
    roles: [USER_ROLES.ADMIN],
  },
  {
    label: 'Products',
    path: ROUTES.PRODUCTS,
    icon: 'product',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.USER],
  },
  {
    label: 'Categories',
    path: ROUTES.CATEGORIES,
    icon: 'category',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  },
  {
    label: 'Users',
    path: ROUTES.USERS,
    icon: 'people',
    roles: [USER_ROLES.ADMIN],
  },
  {
    label: 'Settings',
    path: ROUTES.SETTINGS,
    icon: 'settings',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.USER],
  },
] as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  LOGOUT: 'Successfully logged out!',
  REGISTER: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PRODUCT_CREATED: 'Product created successfully!',
  PRODUCT_UPDATED: 'Product updated successfully!',
  PRODUCT_DELETED: 'Product deleted successfully!',
  CATEGORY_CREATED: 'Category created successfully!',
  CATEGORY_UPDATED: 'Category updated successfully!',
  CATEGORY_DELETED: 'Category deleted successfully!',
} as const;
