import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { useProducts } from '@/queries';
import type { Product } from '@/types';
import { ROUTES } from '@/constants';
import SearchBar from '@/components/common/SearchBar/SearchBar';
import ProductCard from '@/components/common/ProductCard/ProductCard';
import './ProductsFeaturedPage.css';

const ProductsFeaturedPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  // Query for featured products
  const { data: productsData, isLoading } = useProducts({
    search: searchTerm,
    is_featured: true,
    status: 'published',
    page,
    page_size: pageSize,
    ordering: '-created_at',
  });

  const products = productsData?.results || [];
  const total = productsData?.count || 0;

  // Event Handlers
  const handleSearch = () => {
    setPage(1);
  };

  const handleViewProduct = (product: Product) => {
    navigate(`/products/${product.slug}`);
  };

  const handleEditProduct = (product: Product) => {
    const editData = encodeURIComponent(JSON.stringify(product));
    navigate(`/products/create?edit=${editData}`);
  };

  const handleCreateProduct = () => {
    navigate(ROUTES.PRODUCT_CREATE);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const hasMoreProducts = page * pageSize < total;

  return (
    <div className="featured-products-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Featured Products</h1>
          <p>Showcase of highlighted and promoted products</p>
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-number">{total}</span>
              <span className="stat-label">Featured Products</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <Button
            onClick={() => navigate(ROUTES.PRODUCTS)}
            fillMode="outline"
            size="large"
          >
            ← All Products
          </Button>
          <Button
            onClick={handleCreateProduct}
            themeColor="primary"
            size="large"
          >
            ➕ Create Product
          </Button>
        </div>
      </div>

      <div className="page-content">
        <div className="filters-section">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={handleSearch}
            placeholder="Search featured products..."
            className="products-search"
          />
          
          <div className="filter-info">
            <div className="active-filters">
              <span className="filter-tag">✨ Featured Only</span>
              <span className="filter-tag">📢 Published Only</span>
            </div>
          </div>
        </div>

        <Card className="products-content-card">
          <CardBody>
            {isLoading && page === 1 ? (
              <div className="loading-state">
                <div className="loading-spinner">Loading featured products...</div>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="products-grid">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onView={handleViewProduct}
                      onEdit={handleEditProduct}
                      showActions={true}
                      className="featured-product-card"
                    />
                  ))}
                </div>

                {hasMoreProducts && (
                  <div className="load-more-section">
                    <Button
                      onClick={loadMore}
                      themeColor="primary"
                      size="large"
                      disabled={isLoading}
                      className="load-more-button"
                    >
                      {isLoading ? 'Loading...' : `Load More (${total - products.length} remaining)`}
                    </Button>
                  </div>
                )}

                <div className="results-summary">
                  <p>
                    Showing {products.length} of {total} featured products
                  </p>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">✨</div>
                <h3>No Featured Products Found</h3>
                <p>
                  {searchTerm 
                    ? `No featured products match "${searchTerm}". Try adjusting your search.`
                    : "There are no featured products yet. Start by marking some products as featured."
                  }
                </p>
                <div className="empty-actions">
                  {searchTerm ? (
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setPage(1);
                      }}
                      themeColor="secondary"
                      size="medium"
                    >
                      Clear Search
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate(ROUTES.PRODUCTS)}
                      themeColor="primary"
                      size="medium"
                    >
                      View All Products
                    </Button>
                  )}
                  <Button
                    onClick={handleCreateProduct}
                    themeColor="primary"
                    size="medium"
                  >
                    Create New Product
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ProductsFeaturedPage;
