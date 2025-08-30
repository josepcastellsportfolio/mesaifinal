# API Documentation

This document provides comprehensive documentation for the MesaIFinal Frontend API integration.

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [API Client](#api-client)
- [Services](#services)
- [Data Types](#data-types)
- [Error Handling](#error-handling)
- [Caching](#caching)
- [Examples](#examples)

## 🔍 Overview

The frontend uses a centralized API client built with Axios and React Query for efficient data fetching and state management.

### Base Configuration

```typescript
// Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Default timeout
const DEFAULT_TIMEOUT = 10000;
```

## 🔐 Authentication

### Token Management

The API client automatically handles authentication tokens:

```typescript
// Request interceptor - adds token to headers
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handles token refresh and logout
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Authentication Endpoints

```typescript
// Login
POST /auth/login/
{
  "email": "user@example.com",
  "password": "password123"
}

// Register
POST /auth/register/
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}

// Refresh Token
POST /auth/refresh/
{
  "refresh": "refresh_token_here"
}

// Logout
POST /auth/logout/

// Get Profile
GET /auth/profile/

// Update Profile
PATCH /auth/profile/
{
  "first_name": "John",
  "last_name": "Doe"
}
```

## 🚀 API Client

### Core Client

```typescript
import { api } from '@/services/apiClient';

// GET request
const data = await api.get<ResponseType>('/endpoint/');

// POST request
const response = await api.post<ResponseType>('/endpoint/', data);

// PUT request
const response = await api.put<ResponseType>('/endpoint/', data);

// PATCH request
const response = await api.patch<ResponseType>('/endpoint/', data);

// DELETE request
const response = await api.delete<ResponseType>('/endpoint/');
```

### Request Configuration

```typescript
// With custom config
const response = await api.get<ResponseType>('/endpoint/', {
  timeout: 5000,
  headers: {
    'Custom-Header': 'value'
  }
});

// With query parameters
const params = new URLSearchParams({
  search: 'laptop',
  category: 'electronics',
  page: '1',
  pageSize: '20'
});
const response = await api.get<ResponseType>(`/endpoint/?${params.toString()}`);
```

## 📦 Services

### Product Service

```typescript
import { productService } from '@/services/productService';

// Get products with filters
const products = await productService.getProducts({
  search: 'laptop',
  category: 'electronics',
  status: 'published',
  isFeatured: true,
  priceMin: 100,
  priceMax: 1000,
  page: 1,
  pageSize: 20
});

// Get single product
const product = await productService.getProduct('product-slug');

// Create product
const newProduct = await productService.createProduct({
  name: 'New Product',
  description: 'Product description',
  price: 99.99,
  categoryId: 'category-id',
  tagIds: ['tag1', 'tag2']
});

// Update product
const updatedProduct = await productService.updateProduct('product-slug', {
  name: 'Updated Product',
  price: 149.99
});

// Delete product
await productService.deleteProduct('product-slug');

// Get product stats
const stats = await productService.getProductStats();

// Get featured products
const featuredProducts = await productService.getFeaturedProducts();

// Get low stock products
const lowStockProducts = await productService.getLowStockProducts();
```

### Category Service

```typescript
import { categoryService } from '@/services/categoryService';

// Get categories with filters
const categories = await categoryService.getCategories({
  search: 'electronics',
  isActive: true,
  ordering: 'name',
  page: 1,
  pageSize: 20
});

// Get single category
const category = await categoryService.getCategory('category-slug');

// Create category
const newCategory = await categoryService.createCategory({
  name: 'New Category',
  description: 'Category description',
  parent: 'parent-category-slug',
  isActive: true
});

// Update category
const updatedCategory = await categoryService.updateCategory('category-slug', {
  name: 'Updated Category',
  isActive: false
});

// Delete category
await categoryService.deleteCategory('category-slug');

// Get category tree
const categoryTree = await categoryService.getCategoryTree();

// Get category stats
const stats = await categoryService.getCategoryStats();

// Get categories for dropdown
const dropdownCategories = await categoryService.getCategoriesForDropdown();
```

### Tag Service

```typescript
import { tagService } from '@/services/tagService';

// Get tags with filters
const tags = await tagService.getTags({
  search: 'featured',
  isActive: true,
  ordering: 'name',
  page: 1,
  pageSize: 20
});

// Get single tag
const tag = await tagService.getTag('tag-slug');

// Create tag
const newTag = await tagService.createTag({
  name: 'New Tag',
  color: '#FF5733',
  isActive: true
});

// Update tag
const updatedTag = await tagService.updateTag('tag-slug', {
  name: 'Updated Tag',
  color: '#33FF57'
});

// Delete tag
await tagService.deleteTag('tag-slug');

// Get tag stats
const stats = await tagService.getTagStats();

// Get tags for dropdown
const dropdownTags = await tagService.getTagsForDropdown();

// Get popular tags
const popularTags = await tagService.getPopularTags(10);
```

### Auth Service

```typescript
import { authService } from '@/services/authService';

// Login
const authResponse = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Register
const registerResponse = await authService.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
});

// Refresh token
const newTokens = await authService.refreshToken('refresh_token_here');

// Logout
await authService.logout();

// Get profile
const profile = await authService.getProfile();

// Update profile
const updatedProfile = await authService.updateProfile({
  firstName: 'John',
  lastName: 'Doe'
});

// Change password
await authService.changePassword({
  oldPassword: 'oldpassword',
  newPassword: 'newpassword'
});

// Request password reset
await authService.requestPasswordReset('user@example.com');

// Reset password
await authService.resetPassword({
  token: 'reset_token',
  newPassword: 'newpassword'
});
```

## 📊 Data Types

### Core Types

```typescript
// API Response wrapper
interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

// Paginated response
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Product types
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  cost: number;
  stockQuantity: number;
  category: Category | null;
  tags: Tag[];
  status: ProductStatus;
  isFeatured: boolean;
  isInStock: boolean;
  profitMargin: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductCreate {
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  cost: number;
  stockQuantity: number;
  categoryId?: string;
  tagIds?: string[];
  status: ProductStatus;
  isFeatured: boolean;
}

// Category types
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent: Category | null;
  children: Category[];
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

// Tag types
interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

// User types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isStaff: boolean;
  isSuperuser: boolean;
  dateJoined: string;
  lastLogin: string;
}

// Auth types
interface AuthTokens {
  access: string;
  refresh: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
```

### Filter Types

```typescript
// Product filters
interface ProductFilters {
  search?: string;
  category?: string;
  tags?: string[];
  status?: ProductStatus;
  isFeatured?: boolean;
  priceMin?: number;
  priceMax?: number;
  stockQuantityLt?: number;
  stockQuantityGt?: number;
  stockQuantityLte?: number;
  stockQuantityGte?: number;
  page?: number;
  pageSize?: number;
}

// Category filters
interface CategoryFilters {
  search?: string;
  parent?: string;
  isActive?: boolean;
  ordering?: string;
  page?: number;
  pageSize?: number;
}

// Tag filters
interface TagFilters {
  search?: string;
  isActive?: boolean;
  ordering?: string;
  page?: number;
  pageSize?: number;
}
```

## ⚠️ Error Handling

### Error Types

```typescript
interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, unknown>;
  detail?: string;
}

// HTTP Status Codes
enum HTTP_STATUS {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}
```

### Error Handling Patterns

```typescript
// Using try-catch
try {
  const products = await productService.getProducts();
  // Handle success
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    // Handle specific error
  } else {
    console.error('Unexpected error:', error);
    // Handle unexpected error
  }
}

// Using React Query
const { data, error, isLoading } = useProducts();

if (error) {
  return <ErrorMessage error={error} />;
}

if (isLoading) {
  return <LoadingSpinner />;
}
```

### Error Messages

The API client automatically handles common error scenarios:

- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server error

## 💾 Caching

### React Query Caching

```typescript
// Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Custom cache keys
const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Cache invalidation
const createProduct = useCreateProduct();
const handleSubmit = (data: ProductCreate) => {
  createProduct.mutate(data, {
    onSuccess: () => {
      // Invalidate and refetch products
      queryClient.invalidateQueries(['products']);
      
      // Update cache directly
      queryClient.setQueryData(['products'], (oldData) => {
        // Update logic
        return updatedData;
      });
    },
  });
};
```

### Cache Management

```typescript
// Clear all cache
queryClient.clear();

// Remove specific queries
queryClient.removeQueries(['products']);

// Prefetch data
queryClient.prefetchQuery({
  queryKey: ['products'],
  queryFn: () => productService.getProducts(),
});

// Set cache data
queryClient.setQueryData(['products'], productsData);
```

## 📝 Examples

### Complete Product Management

```typescript
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/queries/products.queries';

const ProductManagement = () => {
  const [filters, setFilters] = useState<ProductFilters>({});
  
  // Fetch products
  const { data: products, isLoading, error } = useProducts(filters);
  
  // Mutations
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  // Create product
  const handleCreate = (data: ProductCreate) => {
    createProduct.mutate(data, {
      onSuccess: () => {
        toast.success('Product created successfully!');
      },
      onError: (error) => {
        toast.error(`Failed to create product: ${error.message}`);
      },
    });
  };
  
  // Update product
  const handleUpdate = (slug: string, data: Partial<ProductCreate>) => {
    updateProduct.mutate({ slug, data }, {
      onSuccess: () => {
        toast.success('Product updated successfully!');
      },
      onError: (error) => {
        toast.error(`Failed to update product: ${error.message}`);
      },
    });
  };
  
  // Delete product
  const handleDelete = (slug: string) => {
    deleteProduct.mutate(slug, {
      onSuccess: () => {
        toast.success('Product deleted successfully!');
      },
      onError: (error) => {
        toast.error(`Failed to delete product: ${error.message}`);
      },
    });
  };
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <ProductList 
        products={products?.data || []}
        onEdit={handleUpdate}
        onDelete={handleDelete}
      />
      <CreateProductForm onSubmit={handleCreate} />
    </div>
  );
};
```

### Advanced Filtering

```typescript
const ProductFilters = () => {
  const [filters, setFilters] = useState<ProductFilters>({});
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  
  const handleFilterChange = (key: keyof ProductFilters, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page
    }));
  };
  
  const handleReset = () => {
    setFilters({});
  };
  
  return (
    <FilterPanel
      filters={[
        {
          key: 'search',
          label: 'Search',
          type: 'text',
          placeholder: 'Search products...',
        },
        {
          key: 'category',
          label: 'Category',
          type: 'select',
          options: categories?.data.map(cat => ({
            label: cat.name,
            value: cat.slug,
          })) || [],
        },
        {
          key: 'tags',
          label: 'Tags',
          type: 'multiselect',
          options: tags?.data.map(tag => ({
            label: tag.name,
            value: tag.slug,
          })) || [],
        },
        {
          key: 'priceRange',
          label: 'Price Range',
          type: 'range',
          min: 0,
          max: 1000,
        },
        {
          key: 'isFeatured',
          label: 'Featured Only',
          type: 'checkbox',
        },
      ]}
      values={filters}
      onChange={handleFilterChange}
      onReset={handleReset}
    />
  );
};
```

### File Upload

```typescript
import { uploadFile } from '@/services/apiClient';

const FileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    
    try {
      const response = await uploadFile('/upload/', file, (progress) => {
        setProgress(progress);
      });
      
      toast.success('File uploaded successfully!');
      return response;
    } catch (error) {
      toast.error('Failed to upload file');
      throw error;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  
  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        disabled={uploading}
      />
      {uploading && (
        <div>
          <ProgressBar value={progress} />
          <span>Uploading... {progress}%</span>
        </div>
      )}
    </div>
  );
};
```

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_CACHE=true
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false
```

### Custom Configuration

```typescript
// Custom API client configuration
const customApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': '1.0.0',
  },
});

// Custom interceptors
customApiClient.interceptors.request.use((config) => {
  // Add custom headers
  config.headers['X-Request-ID'] = generateRequestId();
  return config;
});

customApiClient.interceptors.response.use(
  (response) => {
    // Log successful requests
    console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Log errors
    console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error);
    return Promise.reject(error);
  }
);
```

## 📚 Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [REST API Best Practices](https://restfulapi.net/)

---

For more information, please refer to the main project documentation or contact the development team.
