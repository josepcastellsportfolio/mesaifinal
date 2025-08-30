/**
 * Product queries and mutations using React Query
 * Centralized product operations with proper caching and error handling
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/constants';
import type { 
  Product, 
  ApiResponse, 
  ProductFormData, 
  FilterState,
  Review,
  ReviewFormData 
} from '@/types';

// Query keys
export const PRODUCT_QUERY_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCT_QUERY_KEYS.all, 'list'] as const,
  list: (filters: FilterState) => [...PRODUCT_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...PRODUCT_QUERY_KEYS.all, 'detail'] as const,
  detail: (slug: string) => [...PRODUCT_QUERY_KEYS.details(), slug] as const,
  featured: () => [...PRODUCT_QUERY_KEYS.all, 'featured'] as const,
  lowStock: () => [...PRODUCT_QUERY_KEYS.all, 'lowStock'] as const,
  stats: () => [...PRODUCT_QUERY_KEYS.all, 'stats'] as const,
  reviews: (slug: string) => [...PRODUCT_QUERY_KEYS.all, 'reviews', slug] as const,
  related: (slug: string) => [...PRODUCT_QUERY_KEYS.all, 'related', slug] as const,
  priceHistory: (slug: string) => [...PRODUCT_QUERY_KEYS.all, 'priceHistory', slug] as const,
} as const;

// Types for API responses
interface ProductStatsResponse {
  total_products: number;
  published_products: number;
  draft_products: number;
  featured_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
}

interface StockUpdateResponse {
  message: string;
  new_stock_quantity: number;
}

interface BulkUpdateResponse {
  message: string;
  updated_count: number;
}

interface ImportResponse {
  message: string;
  imported_count: number;
  errors?: string[];
}

interface PriceHistoryItem {
  date: string;
  price: string;
}

// ===== QUERIES =====

/**
 * Get paginated list of products with filters
 */
export const useProducts = (
  filters?: FilterState, 
  options?: { page?: number; page_size?: number }
) => {
  const queryKey = [...PRODUCT_QUERY_KEYS.list(filters || {}), options];
  
  return useQuery({
    queryKey,
    queryFn: async (): Promise<ApiResponse<Product>> => {
      const params = new URLSearchParams();
      
      // Add pagination params
      if (options?.page) {
        params.append('page', options.page.toString());
      }
      if (options?.page_size) {
        params.append('page_size', options.page_size.toString());
      }
      
      // Add filter params
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const url = `${API_ENDPOINTS.PRODUCTS}${params.toString() ? `?${params}` : ''}`;
      return api.get<ApiResponse<Product>>(url);
    },
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
  });
};

/**
 * Infinite query for products (useful for pagination)
 */
export const useInfiniteProducts = (filters?: FilterState) => {
  return useInfiniteQuery({
    queryKey: [...PRODUCT_QUERY_KEYS.list(filters || {}), 'infinite'],
    queryFn: async ({ pageParam = 1 }): Promise<ApiResponse<Product>> => {
      const params = new URLSearchParams();
      params.append('page', pageParam.toString());
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== 'page') {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const url = `${API_ENDPOINTS.PRODUCTS}?${params}`;
      return api.get<ApiResponse<Product>>(url);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        return Number(url.searchParams.get('page'));
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Get single product by slug
 */
export const useProduct = (slug: string, enabled = true) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(slug),
    queryFn: async (): Promise<Product> => {
      return api.get<Product>(`${API_ENDPOINTS.PRODUCTS}${slug}/`);
    },
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};

/**
 * Get featured products
 */
export const useFeaturedProducts = (limit?: number) => {
  return useQuery({
    queryKey: [...PRODUCT_QUERY_KEYS.featured(), { limit }],
    queryFn: async (): Promise<ApiResponse<Product>> => {
      const params = new URLSearchParams();
      if (limit) {
        params.append('page_size', limit.toString());
      }
      
      const url = `${API_ENDPOINTS.PRODUCTS}featured/${params.toString() ? `?${params}` : ''}`;
      return api.get<ApiResponse<Product>>(url);
    },
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
  });
};

/**
 * Get low stock products (admin/manager only)
 */
export const useLowStockProducts = (threshold = 10) => {
  return useQuery({
    queryKey: [...PRODUCT_QUERY_KEYS.lowStock(), { threshold }],
    queryFn: async (): Promise<ApiResponse<Product>> => {
      return api.get<ApiResponse<Product>>(`${API_ENDPOINTS.PRODUCTS}low_stock/?threshold=${threshold}`);
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get product statistics (admin/manager only)
 */
export const useProductStats = (enabled = true) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.stats(),
    queryFn: async (): Promise<ProductStatsResponse> => {
      return api.get<ProductStatsResponse>(`${API_ENDPOINTS.PRODUCTS}statistics/`);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get related products
 */
export const useRelatedProducts = (slug: string, limit = 4) => {
  return useQuery({
    queryKey: [...PRODUCT_QUERY_KEYS.related(slug), { limit }],
    queryFn: async (): Promise<Product[]> => {
      return api.get<Product[]>(`${API_ENDPOINTS.PRODUCTS}${slug}/related/?limit=${limit}`);
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Get product price history
 */
export const useProductPriceHistory = (slug: string) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.priceHistory(slug),
    queryFn: async (): Promise<PriceHistoryItem[]> => {
      return api.get<PriceHistoryItem[]>(`${API_ENDPOINTS.PRODUCTS}${slug}/price_history/`);
    },
    enabled: !!slug,
    staleTime: 30 * 60 * 1000, // Consider data fresh for 30 minutes
  });
};

// ===== MUTATIONS =====

/**
 * Create product mutation
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: ProductFormData): Promise<Product> => {
      return api.post<Product>(API_ENDPOINTS.PRODUCTS, productData);
    },
    onSuccess: () => {
      // Invalidate and refetch products lists
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.stats() });
    },
    onError: (error) => {
      console.error('Product creation failed:', error);
    },
  });
};

/**
 * Update product mutation
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: Partial<ProductFormData> }): Promise<Product> => {
      return api.patch<Product>(`${API_ENDPOINTS.PRODUCTS}${slug}/`, data);
    },
    onSuccess: (updatedProduct) => {
      // Update the product in cache
      queryClient.setQueryData(PRODUCT_QUERY_KEYS.detail(updatedProduct.slug), updatedProduct);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.stats() });
    },
    onError: (error) => {
      console.error('Product update failed:', error);
    },
  });
};

/**
 * Delete product mutation
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string): Promise<void> => {
      return api.delete(`${API_ENDPOINTS.PRODUCTS}${slug}/`);
    },
    onSuccess: (_, slug) => {
      // Remove the product from cache
      queryClient.removeQueries({ queryKey: PRODUCT_QUERY_KEYS.detail(slug) });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.stats() });
    },
    onError: (error) => {
      console.error('Product deletion failed:', error);
    },
  });
};

/**
 * Update stock mutation
 */
export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      slug, 
      quantity, 
      operation = 'set' 
    }: { 
      slug: string; 
      quantity: number; 
      operation?: 'set' | 'add' | 'subtract' 
    }): Promise<StockUpdateResponse> => {
      return api.post<StockUpdateResponse>(`${API_ENDPOINTS.PRODUCTS}${slug}/update_stock/`, {
        quantity,
        operation,
      });
    },
    onSuccess: (_, { slug }) => {
      // Invalidate the specific product and related queries
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.detail(slug) });
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.lowStock() });
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.stats() });
    },
    onError: (error) => {
      console.error('Stock update failed:', error);
    },
  });
};

/**
 * Add review mutation
 */
export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, reviewData }: { slug: string; reviewData: ReviewFormData }): Promise<Review> => {
      return api.post<Review>(`${API_ENDPOINTS.PRODUCTS}${slug}/add_review/`, reviewData);
    },
    onSuccess: (_, { slug }) => {
      // Invalidate reviews and product data
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.reviews(slug) });
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.detail(slug) });
    },
    onError: (error) => {
      console.error('Review submission failed:', error);
    },
  });
};

/**
 * Bulk update products mutation
 */
export const useBulkUpdateProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      productIds, 
      updates 
    }: { 
      productIds: number[]; 
      updates: Partial<ProductFormData> 
    }): Promise<BulkUpdateResponse> => {
      return api.post<BulkUpdateResponse>(`${API_ENDPOINTS.PRODUCTS}bulk_update/`, {
        product_ids: productIds,
        updates,
      });
    },
    onSuccess: () => {
      // Invalidate all product-related queries
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
    },
    onError: (error) => {
      console.error('Bulk update failed:', error);
    },
  });
};

/**
 * Export products mutation
 */
export const useExportProducts = () => {
  return useMutation({
    mutationFn: async (filters?: FilterState): Promise<Blob> => {
      const params: Record<string, any> = { format: 'csv' };
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params[key] = value;
          }
        });
      }

      const queryParams = new URLSearchParams(params);
      const response = await api.get(`${API_ENDPOINTS.PRODUCTS}export/?${queryParams}`, {
        responseType: 'blob',
      });

      return response as unknown as Blob;
    },
    onError: (error) => {
      console.error('Export failed:', error);
    },
  });
};

/**
 * Import products mutation
 */
export const useImportProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<ImportResponse> => {
      const formData = new FormData();
      formData.append('file', file);

      return api.post<ImportResponse>(`${API_ENDPOINTS.PRODUCTS}import/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      // Invalidate all product-related queries
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
    },
    onError: (error) => {
      console.error('Import failed:', error);
    },
  });
};
