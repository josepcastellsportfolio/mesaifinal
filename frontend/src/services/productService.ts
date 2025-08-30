import { apiClient } from './apiClient';
import type { Product, ProductCreate, ProductUpdate, ProductFilters } from '../types';

export const productService = {
  // Get products with filters and pagination
  getProducts: async (filters?: ProductFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    return apiClient.get<Product[]>(`/products/?${params.toString()}`);
  },

  // Get single product by slug
  getProduct: async (slug: string) => {
    return apiClient.get<Product>(`/products/${slug}/`);
  },

  // Create new product
  createProduct: async (data: ProductCreate) => {
    return apiClient.post<Product>('/products/', data);
  },

  // Update product
  updateProduct: async (slug: string, data: ProductUpdate) => {
    return apiClient.patch<Product>(`/products/${slug}/`, data);
  },

  // Delete product
  deleteProduct: async (slug: string) => {
    return apiClient.delete<void>(`/products/${slug}/`);
  },

  // Get product stats (for dashboard)
  getProductStats: async () => {
    return apiClient.get<{
      total_products: number;
      published_products: number;
      draft_products: number;
      featured_products: number;
      low_stock_products: number;
    }>('/products/stats/');
  },

  // Get featured products
  getFeaturedProducts: async () => {
    return apiClient.get<Product[]>('/products/featured/');
  },

  // Get low stock products
  getLowStockProducts: async () => {
    return apiClient.get<Product[]>('/products/low-stock/');
  },
};
