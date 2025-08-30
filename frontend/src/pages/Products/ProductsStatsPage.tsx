import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { API_ENDPOINTS, ROUTES } from '@/constants';
import StatsCard from '@/components/common/StatsCard/StatsCard';
import './ProductsStatsPage.css';

interface ProductStatistics {
  total_products: number;
  published_products: number;
  draft_products: number;
  archived_products: number;
  featured_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_categories: number;
  total_tags: number;
  average_price: number;
  total_inventory_value: number;
  products_by_category: Array<{
    category_name: string;
    count: number;
  }>;
  products_by_status: Array<{
    status: string;
    count: number;
  }>;
  low_stock_threshold: number;
}

const ProductsStatsPage: React.FC = () => {
  const navigate = useNavigate();

  // Fetch product statistics
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['products', 'statistics'],
    queryFn: async (): Promise<ProductStatistics> => {
      return api.get<ProductStatistics>(API_ENDPOINTS.PRODUCTS_STATISTICS);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleNavigateToProducts = (filter?: Record<string, string | number | boolean>) => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    navigate(`${ROUTES.PRODUCTS}${queryString ? `?${queryString}` : ''}`);
  };

  const handleNavigateToCategories = () => {
    navigate(ROUTES.CATEGORIES);
  };

  const handleNavigateToTags = () => {
    navigate(ROUTES.TAGS);
  };

  if (isLoading) {
    return (
      <div className="products-stats-page">
        <div className="loading-state">
          <div className="loading-spinner">Loading statistics...</div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="products-stats-page">
        <div className="error-state">
          <h2>Unable to Load Statistics</h2>
          <p>There was an error loading the product statistics.</p>
          <Button onClick={() => window.location.reload()} themeColor="primary">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'error';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="products-stats-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Product Statistics</h1>
          <p>Comprehensive overview of your product inventory and performance</p>
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
            onClick={() => navigate(ROUTES.PRODUCT_CREATE)}
            themeColor="primary"
            size="large"
          >
            ➕ Create Product
          </Button>
        </div>
      </div>

      <div className="page-content">
        {/* Overview Stats */}
        <section className="stats-section">
          <h2 className="section-title">Overview</h2>
          <div className="stats-grid">
            <StatsCard
              title="Total Products"
              value={stats.total_products}
              subtitle="All products in system"
              icon="📦"
              color="primary"
              onClick={() => handleNavigateToProducts()}
            />
            <StatsCard
              title="Published Products"
              value={stats.published_products}
              subtitle="Live and visible"
              icon="✅"
              color="success"
              onClick={() => handleNavigateToProducts({ status: 'published' })}
            />
            <StatsCard
              title="Draft Products"
              value={stats.draft_products}
              subtitle="Not yet published"
              icon="📝"
              color="warning"
              onClick={() => handleNavigateToProducts({ status: 'draft' })}
            />
            <StatsCard
              title="Featured Products"
              value={stats.featured_products}
              subtitle="Highlighted products"
              icon="⭐"
              color="info"
              onClick={() => navigate(ROUTES.PRODUCTS_FEATURED)}
            />
          </div>
        </section>

        {/* Inventory Stats */}
        <section className="stats-section">
          <h2 className="section-title">Inventory</h2>
          <div className="stats-grid">
            <StatsCard
              title="Low Stock"
              value={stats.low_stock_products}
              subtitle={`Less than ${stats.low_stock_threshold} units`}
              icon="⚠️"
              color="warning"
              onClick={() => navigate(ROUTES.PRODUCTS_LOW_STOCK)}
            />
            <StatsCard
              title="Out of Stock"
              value={stats.out_of_stock_products}
              subtitle="0 units available"
              icon="❌"
              color="error"
              onClick={() => handleNavigateToProducts({ stock_quantity: 0 })}
            />
            <StatsCard
              title="Average Price"
              value={`$${stats.average_price.toFixed(2)}`}
              subtitle="Across all products"
              icon="💰"
              color="success"
            />
            <StatsCard
              title="Total Inventory Value"
              value={`$${stats.total_inventory_value.toLocaleString()}`}
              subtitle="Current stock value"
              icon="💎"
              color="primary"
            />
          </div>
        </section>

        {/* Organization Stats */}
        <section className="stats-section">
          <h2 className="section-title">Organization</h2>
          <div className="stats-grid">
            <StatsCard
              title="Categories"
              value={stats.total_categories}
              subtitle="Product categories"
              icon="📁"
              color="info"
              onClick={handleNavigateToCategories}
            />
            <StatsCard
              title="Tags"
              value={stats.total_tags}
              subtitle="Product tags"
              icon="🏷️"
              color="secondary"
              onClick={handleNavigateToTags}
            />
          </div>
        </section>

        {/* Detailed Breakdowns */}
        <div className="breakdown-section">
          <div className="breakdown-cards">
            {/* Products by Category */}
            <Card className="breakdown-card">
              <CardBody>
                <h3 className="card-title">Products by Category</h3>
                <div className="breakdown-list">
                  {stats.products_by_category.map((item, index) => (
                    <div key={index} className="breakdown-item">
                      <div className="item-info">
                        <span className="item-name">{item.category_name}</span>
                        <span className="item-count">{item.count} products</span>
                      </div>
                      <div className="item-bar">
                        <div 
                          className="item-fill"
                          style={{ 
                            width: `${(item.count / stats.total_products) * 100}%`,
                            backgroundColor: 'var(--color-primary)'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Products by Status */}
            <Card className="breakdown-card">
              <CardBody>
                <h3 className="card-title">Products by Status</h3>
                <div className="breakdown-list">
                  {stats.products_by_status.map((item, index) => (
                    <div key={index} className="breakdown-item">
                      <div className="item-info">
                        <span className="item-name">
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                        <span className="item-count">{item.count} products</span>
                      </div>
                      <div className="item-bar">
                        <div 
                          className="item-fill"
                          style={{ 
                            width: `${(item.count / stats.total_products) * 100}%`,
                            backgroundColor: `var(--color-${getStatusColor(item.status)})`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <Button
              onClick={() => navigate(ROUTES.PRODUCTS_LOW_STOCK)}
              themeColor="warning"
              size="large"
              className="action-button"
            >
              🔍 View Low Stock Products
            </Button>
            <Button
              onClick={() => navigate(ROUTES.PRODUCTS_FEATURED)}
              themeColor="info"
              size="large"
              className="action-button"
            >
              ⭐ Manage Featured Products
            </Button>
            <Button
              onClick={() => navigate(ROUTES.PRODUCTS_IMPORT)}
              themeColor="secondary"
              size="large"
              className="action-button"
            >
              📥 Import Products
            </Button>
            <Button
              onClick={() => navigate(ROUTES.PRODUCTS_EXPORT)}
              themeColor="primary"
              size="large"
              className="action-button"
            >
              📤 Export Products
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductsStatsPage;
