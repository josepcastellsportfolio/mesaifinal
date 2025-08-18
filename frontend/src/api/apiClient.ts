/**
 * Centralized API client using axios
 * Handles authentication, error management, and base configuration
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, STORAGE_KEYS, HTTP_STATUS, API_ENDPOINTS } from '@/constants';

// Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  detail?: string;
  status?: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// Token management utilities
export const tokenManager = {
  getTokens(): AuthTokens | null {
    const access = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (access && refresh) {
      return { access, refresh };
    }
    return null;
  },

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh);
  },

  clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  },

  getAccessToken(): string | null {
    const tokens = this.getTokens();
    if (tokens?.access && !this.isTokenExpired(tokens.access)) {
      return tokens.access;
    }
    return null;
  }
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle token refresh for 401 errors
    if (
      error.response?.status === HTTP_STATUS.UNAUTHORIZED &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      
      const tokens = tokenManager.getTokens();
      if (tokens?.refresh) {
        try {
          const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.REFRESH}`, {
            refresh: tokens.refresh,
          });
          
          const newTokens: AuthTokens = response.data;
          tokenManager.setTokens(newTokens);
          
          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          tokenManager.clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        tokenManager.clearTokens();
        window.location.href = '/login';
      }
    }
    
    // Transform error to our ApiError format
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status,
    };

    if (error.response?.data) {
      const errorData = error.response.data as any;
      
      // Handle different error formats
      if (errorData.non_field_errors) {
        apiError.message = Array.isArray(errorData.non_field_errors) 
          ? errorData.non_field_errors[0] 
          : errorData.non_field_errors;
      } else if (errorData.email) {
        apiError.message = Array.isArray(errorData.email) 
          ? errorData.email[0] 
          : errorData.email;
      } else if (errorData.password) {
        apiError.message = Array.isArray(errorData.password) 
          ? errorData.password[0] 
          : errorData.password;
      } else if (errorData.message || errorData.detail) {
        apiError.message = errorData.message || errorData.detail;
      }
      
      apiError.errors = errorData;
      apiError.detail = errorData.detail;
    }

    // Handle specific status codes
    switch (error.response?.status) {
      case HTTP_STATUS.BAD_REQUEST:
        apiError.message = apiError.message || 'Invalid request data';
        break;
      case HTTP_STATUS.UNAUTHORIZED:
        apiError.message = 'Authentication required';
        break;
      case HTTP_STATUS.FORBIDDEN:
        apiError.message = 'Access denied';
        break;
      case HTTP_STATUS.NOT_FOUND:
        apiError.message = 'Resource not found';
        break;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        apiError.message = 'Server error occurred';
        break;
    }
    
    return Promise.reject(apiError);
  }
);

// Generic request wrapper
export const makeRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient(config);
  return response.data;
};

// HTTP method helpers
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    makeRequest<T>({ method: 'GET', url, ...config }),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    makeRequest<T>({ method: 'POST', url, data, ...config }),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    makeRequest<T>({ method: 'PUT', url, data, ...config }),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    makeRequest<T>({ method: 'PATCH', url, data, ...config }),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    makeRequest<T>({ method: 'DELETE', url, ...config }),
};

// File upload helper
export const uploadFile = async (
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);

  return makeRequest({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};

export default apiClient;
