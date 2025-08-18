/**
 * Authentication queries and mutations using React Query
 * Centralized auth operations with proper caching and error handling
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, tokenManager } from '@/api/apiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants';
import type { User, LoginCredentials, RegisterData, AuthTokens } from '@/types';

// Query keys
export const AUTH_QUERY_KEYS = {
  currentUser: ['auth', 'currentUser'] as const,
  profile: ['auth', 'profile'] as const,
} as const;

// Types for API responses
interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

interface RegisterResponse {
  message: string;
  user_id: number;
}

interface MessageResponse {
  message: string;
}

// ===== QUERIES =====

/**
 * Get current authenticated user
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: async (): Promise<User> => {
      return api.get<User>(API_ENDPOINTS.USER_ME);
    },
    enabled: !!tokenManager.getAccessToken(), // Only run if user is authenticated
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// ===== MUTATIONS =====

/**
 * Login mutation
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const tokens = await api.post<AuthTokens>(API_ENDPOINTS.LOGIN, credentials);
      
      // Store tokens
      tokenManager.setTokens(tokens);
      
      // Fetch user data
      const user = await api.get<User>(API_ENDPOINTS.USER_ME);
      
      // Store user data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return { user, tokens };
    },
    onSuccess: (data) => {
      // Update user query cache
      queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, data.user);
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      // Clear tokens and user data
      tokenManager.clearTokens();
      
      // Optional: Call logout endpoint if backend supports it
      // await api.post('/auth/logout/');
    },
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: ['auth'] });
      
      // Clear all cached data
      queryClient.clear();
    },
  });
};

/**
 * Register mutation
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: RegisterData): Promise<RegisterResponse> => {
      return api.post<RegisterResponse>(API_ENDPOINTS.USER_REGISTER, userData);
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
};

/**
 * Update profile mutation
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: Partial<User>): Promise<User> => {
      const user = await api.patch<User>(API_ENDPOINTS.USER_PROFILE, profileData);
      
      // Update stored user data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return user;
    },
    onSuccess: (updatedUser) => {
      // Update user query cache
      queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, updatedUser);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile });
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
};

/**
 * Refresh token mutation
 */
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<AuthTokens> => {
      const tokens = tokenManager.getTokens();
      if (!tokens?.refresh) {
        throw new Error('No refresh token available');
      }

      const newTokens = await api.post<AuthTokens>(API_ENDPOINTS.REFRESH, {
        refresh: tokens.refresh,
      });

      tokenManager.setTokens(newTokens);
      return newTokens;
    },
    onSuccess: () => {
      // Invalidate current user query to refetch with new token
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
    },
    onError: () => {
      // If refresh fails, clear tokens and redirect to login
      tokenManager.clearTokens();
      queryClient.clear();
      window.location.href = '/login';
    },
  });
};

/**
 * Verify token mutation
 */
export const useVerifyToken = () => {
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      try {
        const tokens = tokenManager.getTokens();
        if (!tokens?.access) {
          return false;
        }

        await api.post(API_ENDPOINTS.VERIFY, { token: tokens.access });
        return true;
      } catch {
        return false;
      }
    },
  });
};

/**
 * Request password reset mutation
 */
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: async (email: string): Promise<MessageResponse> => {
      return api.post<MessageResponse>('/auth/password-reset/', { email });
    },
    onError: (error) => {
      console.error('Password reset request failed:', error);
    },
  });
};

/**
 * Reset password mutation
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: {
      token: string;
      newPassword: string;
      confirmPassword: string;
    }): Promise<MessageResponse> => {
      return api.post<MessageResponse>('/auth/password-reset-confirm/', {
        token: data.token,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });
    },
    onError: (error) => {
      console.error('Password reset failed:', error);
    },
  });
};

/**
 * Change password mutation
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }): Promise<MessageResponse> => {
      return api.post<MessageResponse>('/auth/change-password/', {
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });
    },
    onError: (error) => {
      console.error('Password change failed:', error);
    },
  });
};

// ===== UTILITY FUNCTIONS =====

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const accessToken = tokenManager.getAccessToken();
  return !!(accessToken && !tokenManager.isTokenExpired(accessToken));
};

/**
 * Get stored user data
 */
export const getStoredUser = (): User | null => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

/**
 * Check if user has specific role
 */
export const hasRole = (requiredRole: string, user?: User): boolean => {
  const currentUser = user || getStoredUser();
  if (!currentUser) return false;

  const roleHierarchy = {
    admin: ['admin', 'manager', 'user'],
    manager: ['manager', 'user'],
    user: ['user'],
  };

  return roleHierarchy[currentUser.role]?.includes(requiredRole) || false;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (roles: string[], user?: User): boolean => {
  return roles.some(role => hasRole(role, user));
};
