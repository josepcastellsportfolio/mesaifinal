import { lazy } from 'react';

// Lazy load pages for code splitting
export const DashboardPage = lazy(() => import('./Dashboard/DashboardPage').then(module => ({ default: module.default })));
export const LoginPage = lazy(() => import('./Login/Login').then(module => ({ default: module.default })));

// Products
export const ProductsPage = lazy(() => import('./Products/ProductsPage').then(module => ({ default: module.default })));
export const ProductDetailPage = lazy(() => import('./Products/ProductDetailPage').then(module => ({ default: module.default })));
export const CreateProductPage = lazy(() => import('./Products/CreateProductPage').then(module => ({ default: module.default })));
export const ProductsFeaturedPage = lazy(() => import('./Products/ProductsFeaturedPage').then(module => ({ default: module.default })));
export const ProductsLowStockPage = lazy(() => import('./Products/ProductsLowStockPage').then(module => ({ default: module.default })));
export const ProductsStatsPage = lazy(() => import('./Products/ProductsStatsPage').then(module => ({ default: module.default })));
export const ProductsExportPage = lazy(() => import('./Products/ProductsExportPage').then(module => ({ default: module.default })));
export const ProductsImportPage = lazy(() => import('./Products/ProductsImportPage').then(module => ({ default: module.default })));

// Categories
export const CategoriesPage = lazy(() => import('./Categories/CategoriesPage').then(module => ({ default: module.default })));
export const CategoriesDetail = lazy(() => import('./Categories/CategoriesDetail').then(module => ({ default: module.default })));
export const CreateCategories = lazy(() => import('./Categories/CreateCategories').then(module => ({ default: module.default })));

// Tags
export const TagsPage = lazy(() => import('./Tags/TagsPage').then(module => ({ default: module.default })));
export const TagDetail = lazy(() => import('./Tags/TagDetail').then(module => ({ default: module.default })));
export const CreateTag = lazy(() => import('./Tags/CreateTag').then(module => ({ default: module.default })));

// Reviews
export const ReviewsPage = lazy(() => import('./Reviews/ReviewsPage').then(module => ({ default: module.default })));
export const ReviewDetail = lazy(() => import('./Reviews/ReviewDetail').then(module => ({ default: module.default })));
export const CreateReview = lazy(() => import('./Reviews/CreateReview').then(module => ({ default: module.default })));
