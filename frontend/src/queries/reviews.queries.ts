import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import type { Review, ApiResponse } from '@/types';
import { API_ENDPOINTS } from '@/constants';

// Query Keys
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (params: Record<string, string | number>) => [...reviewKeys.lists(), params] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: number) => [...reviewKeys.details(), id] as const,
  product: (productId: number) => [...reviewKeys.all, 'product', productId] as const,
};

// Interfaces
export interface ReviewFilters {
  search?: string;
  product?: number;
  user?: string;
  rating?: number;
  is_approved?: boolean;
  is_verified_purchase?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface ReviewCreate {
  product: number;
  rating: number;
  title: string;
  content: string;
}

export interface ReviewUpdate {
  rating?: number;
  title?: string;
  content?: string;
  is_approved?: boolean;
}

// Queries
export const useReviews = (params: ReviewFilters = {}) => {
  return useQuery({
    queryKey: reviewKeys.list(params as Record<string, string | number>),
    queryFn: async (): Promise<ApiResponse<Review>> => {
      return api.get<ApiResponse<Review>>(API_ENDPOINTS.REVIEWS, { params });
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useReview = (id: number) => {
  return useQuery({
    queryKey: reviewKeys.detail(id),
    queryFn: async (): Promise<Review> => {
      return api.get<Review>(`${API_ENDPOINTS.REVIEWS}${id}/`);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductReviews = (productId: number, params: Omit<ReviewFilters, 'product'> = {}) => {
  return useQuery({
    queryKey: reviewKeys.product(productId),
    queryFn: async (): Promise<ApiResponse<Review>> => {
      return api.get<ApiResponse<Review>>(API_ENDPOINTS.REVIEWS, {
        params: { ...params, product: productId }
      });
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  });
};

// Mutations
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReviewCreate): Promise<Review> => {
      return api.post<Review>(API_ENDPOINTS.REVIEWS, data);
    },
    onSuccess: (newReview) => {
      // Invalidate reviews lists
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      
      // Invalidate product reviews
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(newReview.product) });
      
      // Add to cache
      queryClient.setQueryData(reviewKeys.detail(newReview.id), newReview);
      
      // Invalidate product data to update review count and average rating
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      console.log('Review created successfully:', newReview);
    },
    onError: (error) => {
      console.error('Review creation failed:', error);
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ReviewUpdate }): Promise<Review> => {
      return api.patch<Review>(`${API_ENDPOINTS.REVIEWS}${id}/`, data);
    },
    onSuccess: (updatedReview) => {
      // Update cache
      queryClient.setQueryData(reviewKeys.detail(updatedReview.id), updatedReview);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      
      // Invalidate product reviews
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(updatedReview.product) });
      
      // Invalidate product data to update review count and average rating
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      console.log('Review updated successfully:', updatedReview);
    },
    onError: (error) => {
      console.error('Review update failed:', error);
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`${API_ENDPOINTS.REVIEWS}${id}/`);
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: reviewKeys.detail(deletedId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      
      // Invalidate all product reviews (we don't know which product)
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      
      // Invalidate product data to update review count and average rating
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      console.log('Review deleted successfully');
    },
    onError: (error) => {
      console.error('Review deletion failed:', error);
    },
  });
};

// Review-specific actions
export const useApproveReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<Review> => {
      return api.post<Review>(`${API_ENDPOINTS.REVIEWS}${id}/approve/`);
    },
    onSuccess: (updatedReview) => {
      // Update cache
      queryClient.setQueryData(reviewKeys.detail(updatedReview.id), updatedReview);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      
      // Invalidate product reviews
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(updatedReview.product) });
      
      console.log('Review approved successfully:', updatedReview);
    },
    onError: (error) => {
      console.error('Review approval failed:', error);
    },
  });
};

export const useRejectReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<Review> => {
      return api.post<Review>(`${API_ENDPOINTS.REVIEWS}${id}/reject/`);
    },
    onSuccess: (updatedReview) => {
      // Update cache
      queryClient.setQueryData(reviewKeys.detail(updatedReview.id), updatedReview);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      
      // Invalidate product reviews
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(updatedReview.product) });
      
      console.log('Review rejected successfully:', updatedReview);
    },
    onError: (error) => {
      console.error('Review rejection failed:', error);
    },
  });
};

export const useMarkReviewHelpful = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<Review> => {
      // Cambia 'helpful' por 'mark_helpful'
      return api.post<Review>(`${API_ENDPOINTS.REVIEWS}${id}/mark_helpful/`);
    },
    onSuccess: (updatedReview) => {
      // Update cache
      queryClient.setQueryData(reviewKeys.detail(updatedReview.id), updatedReview);
      // Invalidate lists to show updated helpful votes
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      console.log('Review marked as helpful:', updatedReview);
    },
    onError: (error) => {
      console.error('Mark review as helpful failed:', error);
    },
  });
};

// Bulk operations
export const useBulkApproveReviews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]): Promise<void> => {
      await Promise.all(
        ids.map(id => 
          api.post(`${API_ENDPOINTS.REVIEWS}${id}/approve/`)
        )
      );
    },
    onSuccess: () => {
      // Invalidate all review queries
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      
      // Invalidate product data
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      console.log('Bulk review approval completed successfully');
    },
    onError: (error) => {
      console.error('Bulk review approval failed:', error);
    },
  });
};

export const useBulkRejectReviews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]): Promise<void> => {
      await Promise.all(
        ids.map(id => 
          api.post(`${API_ENDPOINTS.REVIEWS}${id}/reject/`)
        )
      );
    },
    onSuccess: () => {
      // Invalidate all review queries
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      
      // Invalidate product data
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      console.log('Bulk review rejection completed successfully');
    },
    onError: (error) => {
      console.error('Bulk review rejection failed:', error);
    },
  });
};
