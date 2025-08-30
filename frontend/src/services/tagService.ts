import { apiClient } from './apiClient';
import type { Tag } from '../types';

export interface TagCreate {
  name: string;
  color: string;
  isActive?: boolean;
}

export interface TagUpdate extends Partial<TagCreate> {
  id: string;
}

export interface TagFilters {
  search?: string;
  isActive?: boolean;
  ordering?: string;
  page?: number;
  pageSize?: number;
}

export const tagService = {
  // Get tags with filters and pagination
  getTags: async (filters?: TagFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    return apiClient.get<Tag[]>(`/tags/?${params.toString()}`);
  },

  // Get single tag by slug
  getTag: async (slug: string) => {
    return apiClient.get<Tag>(`/tags/${slug}/`);
  },

  // Create new tag
  createTag: async (data: TagCreate) => {
    return apiClient.post<Tag>('/tags/', data);
  },

  // Update tag
  updateTag: async (slug: string, data: TagUpdate) => {
    return apiClient.patch<Tag>(`/tags/${slug}/`, data);
  },

  // Delete tag
  deleteTag: async (slug: string) => {
    return apiClient.delete<void>(`/tags/${slug}/`);
  },

  // Get tag stats
  getTagStats: async () => {
    return apiClient.get<{
      total_tags: number;
      active_tags: number;
      inactive_tags: number;
      tags_with_products: number;
    }>('/tags/stats/');
  },

  // Get tags for dropdown (simplified data)
  getTagsForDropdown: async () => {
    return apiClient.get<Array<{ id: string; name: string; color: string }>>('/tags/dropdown/');
  },

  // Get popular tags (most used)
  getPopularTags: async (limit = 10) => {
    return apiClient.get<Tag[]>(`/tags/popular/?limit=${limit}`);
  },
};
