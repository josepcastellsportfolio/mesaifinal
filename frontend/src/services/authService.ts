import { apiClient } from './apiClient';
import type { User, AuthTokens, LoginCredentials, RegisterData } from '../types';

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await apiClient.post<{ user: User; tokens: AuthTokens }>('/auth/login/', credentials);
    return response;
  },

  // Register user
  register: async (data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await apiClient.post<{ user: User; tokens: AuthTokens }>('/auth/register/', data);
    return response;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>('/auth/refresh/', { refresh: refreshToken });
    return response;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout/');
    } catch (error) {
      // Even if logout fails, we should clear local storage
      console.warn('Logout request failed, but clearing local storage:', error);
    }
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/profile/');
    return response;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch<User>('/auth/profile/', data);
    return response;
  },

  // Change password
  changePassword: async (data: { old_password: string; new_password: string }): Promise<void> => {
    await apiClient.post('/auth/change-password/', data);
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post('/auth/password-reset/', { email });
  },

  // Reset password with token
  resetPassword: async (data: { token: string; new_password: string }): Promise<void> => {
    await apiClient.post('/auth/password-reset/confirm/', data);
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post('/auth/verify-email/', { token });
  },

  // Resend verification email
  resendVerificationEmail: async (email: string): Promise<void> => {
    await apiClient.post('/auth/resend-verification/', { email });
  },
};
