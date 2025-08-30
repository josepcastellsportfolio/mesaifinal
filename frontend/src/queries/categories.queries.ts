/**
 * Category queries and mutations using React Query
 * Mirrors products queries style for consistency
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, Category } from '@/types';

// Query keys
export const CATEGORY_QUERY_KEYS = {
  all: ['categories'] as const,
  lists: () => [...CATEGORY_QUERY_KEYS.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [
    ...CATEGORY_QUERY_KEYS.lists(),
    params || {},
  ] as const,
  details: () => [...CATEGORY_QUERY_KEYS.all, 'detail'] as const,
  detail: (slug: string) => [...CATEGORY_QUERY_KEYS.details(), slug] as const,
} as const;

// ===== QUERIES =====

/**
 * Get paginated list of categories
 */
export const useCategories = (
  filters?: { search?: string; parent?: number | null; is_active?: boolean },
  options?: { page?: number; page_size?: number }
) => {
  const queryKey = [...CATEGORY_QUERY_KEYS.list(filters || {}), options];

  return useQuery({
    queryKey,
    queryFn: async (): Promise<ApiResponse<Category>> => {
      const params = new URLSearchParams();

      if (options?.page) params.append('page', String(options.page));
      if (options?.page_size) params.append('page_size', String(options.page_size));

      if (filters?.search) params.append('search', filters.search);
      if (filters?.parent !== undefined && filters.parent !== null) {
        params.append('parent', String(filters.parent));
      }
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));

      const url = `${API_ENDPOINTS.CATEGORIES}${params.toString() ? `?${params}` : ''}`;
      return api.get<ApiResponse<Category>>(url);
    },
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Get single category by slug
 */
export const useCategory = (slug: string, enabled = true) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.detail(slug),
    queryFn: async (): Promise<Category> => {
      return api.get<Category>(`${API_ENDPOINTS.CATEGORIES}${slug}/`);
    },
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

// ===== MUTATIONS =====

/**
 * Create category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Category>): Promise<Category> => {
      return api.post<Category>(API_ENDPOINTS.CATEGORIES, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.lists() });
    },
  });
};

/**
 * Update category
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: Partial<Category> }): Promise<Category> => {
      return api.patch<Category>(`${API_ENDPOINTS.CATEGORIES}${slug}/`, data);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(CATEGORY_QUERY_KEYS.detail(updated.slug), updated);
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.lists() });
    },
  });
};

/**
 * Delete category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string): Promise<void> => {
      await api.delete(`${API_ENDPOINTS.CATEGORIES}${slug}/`);
    },
    onSuccess: (_, slug) => {
      queryClient.removeQueries({ queryKey: CATEGORY_QUERY_KEYS.detail(slug) });
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.lists() });
    },
  });
};


