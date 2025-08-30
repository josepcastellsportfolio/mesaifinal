import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import ProtectedRoute from '@/components/common/ProtectedRoute/ProtectedRoute';
import AppLayout from '@/components/common/Layout/AppLayout';
import LoginPage from '@/pages/Login/Login';
import Dashboard from '@/pages/Dashboard/DashboardPage';
import { ROUTES } from '@/constants';
import '@/design-system/tokens/index.css';
import '@/design-system/components/index.css';
// Products
import ProductsPage from '@/pages/Products/ProductsPage';
import ProductDetailPage from '@/pages/Products/ProductDetailPage';
import CreateProductPage from '@/pages/Products/CreateProductPage';
import ProductsStatsPage from '@/pages/Products/ProductsStatsPage';
import ProductsFeaturedPage from '@/pages/Products/ProductsFeaturedPage';
import ProductsLowStockPage from '@/pages/Products/ProductsLowStockPage';
import ProductsImportPage from '@/pages/Products/ProductsImportPage';
import ProductsExportPage from '@/pages/Products/ProductsExportPage';
// Categories
import CategoriesPage from '@/pages/Categories/CategoriesPage';
import CategoriesDetail from '@/pages/Categories/CategoriesDetail';
import CreateCategories from '@/pages/Categories/CreateCategories';
// Tags
import TagsPage from '@/pages/Tags/TagsPage';
import TagDetail from '@/pages/Tags/TagDetail';
import CreateTag from '@/pages/Tags/CreateTag';
// Reviews
import ReviewsPage from '@/pages/Reviews/ReviewsPage';
import ReviewDetail from '@/pages/Reviews/ReviewDetail';
import CreateReview from '@/pages/Reviews/CreateReview';
// Users
import UsersPage from '@/pages/Users/UsersPage';
import UserDetailPage from '@/pages/Users/UserDetailPage';
import ProfilePage from '@/pages/Users/ProfilePage';
import UserCreatePage from './pages/Users/UserCreatePage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path={ROUTES.LOGIN} 
            element={
              isAuthenticated ? (
                <Navigate to={ROUTES.DASHBOARD} replace />
              ) : (
                <LoginPage />
              )
            } 
          />

          {/* Protected Routes with Layout */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            {/* Products CRUD and custom routes */}
            <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
            <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />
            <Route path={ROUTES.PRODUCT_CREATE} element={<CreateProductPage />} />
            <Route path={ROUTES.PRODUCT_EDIT} element={<CreateProductPage />} />
            <Route path={ROUTES.PRODUCTS_STATS} element={<ProductsStatsPage />} />
            <Route path={ROUTES.PRODUCTS_STATISTICS} element={<ProductsStatsPage />} />
            <Route path={ROUTES.PRODUCTS_FEATURED} element={<ProductsFeaturedPage />} />
            <Route path={ROUTES.PRODUCTS_LOW_STOCK} element={<ProductsLowStockPage />} />
            <Route path={ROUTES.PRODUCTS_IMPORT} element={<ProductsImportPage />} />
            <Route path={ROUTES.PRODUCTS_EXPORT} element={<ProductsExportPage />} />

            {/* Categories CRUD routes */}
            <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
            <Route path={ROUTES.CATEGORY_DETAIL} element={<CategoriesDetail />} />
            <Route path={ROUTES.CATEGORY_CREATE} element={<CreateCategories />} />
            <Route path={ROUTES.CATEGORY_EDIT} element={<CreateCategories />} />

            {/* Tags CRUD routes */}
            <Route path={ROUTES.TAGS} element={<TagsPage />} />
            <Route path={ROUTES.TAG_CREATE} element={<CreateTag />} />
            <Route path={ROUTES.TAG_DETAIL} element={<TagDetail />} />
            <Route path={ROUTES.TAG_EDIT} element={<CreateTag />} />

            {/* Reviews CRUD routes */}
            <Route path={ROUTES.REVIEWS} element={<ReviewsPage />} />
            <Route path={ROUTES.REVIEW_CREATE} element={<CreateReview />} />
            <Route path={ROUTES.REVIEW_EDIT} element={<CreateReview />} />
            <Route path={ROUTES.REVIEW_DETAIL} element={<ReviewDetail />} />
            {/* Users CRUD routes */}
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path={ROUTES.USERS} element={<UsersPage />} />
            <Route path={ROUTES.USER_DETAIL} element={<UserDetailPage />} />
            <Route path={ROUTES.USER_EDIT} element={<UserCreatePage />} />
            <Route path={ROUTES.USER_CREATE} element={<UserCreatePage />} />
          </Route>
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
