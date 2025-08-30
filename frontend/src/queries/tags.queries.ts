import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import type { Tag, ApiResponse } from '@/types';
import { API_ENDPOINTS } from '@/constants';

// Query Keys
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (params: Record<string, string | number>) => [...tagKeys.lists(), params] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (slug: string) => [...tagKeys.details(), slug] as const,
};

// Interfaces
export interface TagFilters {
  search?: string;
  is_active?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface TagCreate {
  name: string;
  color: string;
  is_active?: boolean;
}

export interface TagUpdate extends Partial<TagCreate> {
  slug?: string;
}

// Queries
export const useTags = (params: TagFilters = {}) => {
  return useQuery({
    queryKey: tagKeys.list(params as Record<string, string | number>),
    queryFn: async (): Promise<ApiResponse<Tag>> => {
      return api.get<ApiResponse<Tag>>(API_ENDPOINTS.TAGS, { params });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTag = (slug: string) => {
  return useQuery({
    queryKey: tagKeys.detail(slug),
    queryFn: async (): Promise<Tag> => {
      return api.get<Tag>(`${API_ENDPOINTS.TAGS}${slug}/`);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutations
export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TagCreate): Promise<Tag> => {
      return api.post<Tag>(API_ENDPOINTS.TAGS, data);
    },
    onSuccess: (newTag) => {
      // Invalidate and refetch tags list
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      
      // Add the new tag to the cache
      queryClient.setQueryData(tagKeys.detail(newTag.slug), newTag);
      
      console.log('Tag created successfully:', newTag);
    },
    onError: (error) => {
      console.error('Tag creation failed:', error);
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: TagUpdate }): Promise<Tag> => {
      return api.patch<Tag>(`${API_ENDPOINTS.TAGS}${slug}/`, data);
    },
    onSuccess: (updatedTag) => {
      // Invalidate and refetch tags list
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      
      // Update the tag in the cache
      queryClient.setQueryData(tagKeys.detail(updatedTag.slug), updatedTag);
      
      console.log('Tag updated successfully:', updatedTag);
    },
    onError: (error) => {
      console.error('Tag update failed:', error);
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string): Promise<void> => {
      await api.delete(`${API_ENDPOINTS.TAGS}${slug}/`);
    },
    onSuccess: (_, deletedSlug) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: tagKeys.detail(deletedSlug) });
      
      // Invalidate lists to trigger refetch
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      
      console.log('Tag deleted successfully');
    },
    onError: (error) => {
      console.error('Tag deletion failed:', error);
    },
  });
};

// Bulk operations
export const useBulkUpdateTags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slugs,
      data,
    }: {
      slugs: string[];
      data: Partial<TagUpdate>;
    }): Promise<void> => {
      await Promise.all(
        slugs.map((slug) =>
          api.patch(`${API_ENDPOINTS.TAGS}${slug}/`, data)
        )
      );
    },
    onSuccess: () => {
      // Invalidate all tag queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      console.log('Bulk tag update completed successfully');
    },
    onError: (error) => {
      console.error('Bulk tag update failed:', error);
    },
  });
};

export const useBulkDeleteTags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slugs: string[]): Promise<void> => {
      await Promise.all(
        slugs.map((slug) =>
          api.delete(`${API_ENDPOINTS.TAGS}${slug}/`)
        )
      );
    },
    onSuccess: (_, deletedSlugs) => {
      // Remove from cache
      deletedSlugs.forEach((slug) => {
        queryClient.removeQueries({ queryKey: tagKeys.detail(slug) });
      });
      
      // Invalidate lists to trigger refetch
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      
      console.log('Bulk tag deletion completed successfully');
    },
    onError: (error) => {
      console.error('Bulk tag deletion failed:', error);
    },
  });
};