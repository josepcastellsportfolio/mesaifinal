import { apiClient } from './apiClient';
import type { Category } from '../types';

export interface CategoryCreate {
  name: string;
  description: string;
  parent?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CategoryUpdate extends Partial<CategoryCreate> {
  id: string;
}

export interface CategoryFilters {
  search?: string;
  parent?: string;
  isActive?: boolean;
  ordering?: string;
  page?: number;
  pageSize?: number;
}

export const categoryService = {
  // Get categories with filters and pagination
  getCategories: async (filters?: CategoryFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    return apiClient.get<Category[]>(`/categories/?${params.toString()}`);
  },

  // Get single category by slug
  getCategory: async (slug: string) => {
    return apiClient.get<Category>(`/categories/${slug}/`);
  },

  // Create new category
  createCategory: async (data: CategoryCreate) => {
    return apiClient.post<Category>('/categories/', data);
  },

  // Update category
  updateCategory: async (slug: string, data: CategoryUpdate) => {
    return apiClient.patch<Category>(`/categories/${slug}/`, data);
  },

  // Delete category
  deleteCategory: async (slug: string) => {
    return apiClient.delete<void>(`/categories/${slug}/`);
  },

  // Get category tree (hierarchical structure)
  getCategoryTree: async () => {
    return apiClient.get<Category[]>('/categories/tree/');
  },

  // Get category stats
  getCategoryStats: async () => {
    return apiClient.get<{
      total_categories: number;
      active_categories: number;
      inactive_categories: number;
      categories_with_products: number;
    }>('/categories/stats/');
  },

  // Get categories for dropdown (simplified data)
  getCategoriesForDropdown: async () => {
    return apiClient.get<Array<{ id: string; name: string; slug: string }>>('/categories/dropdown/');
  },
};
