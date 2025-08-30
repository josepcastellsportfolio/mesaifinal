/**
 * Dashboard page component displaying key metrics and recent activity.
 * Uses Telerik UI components for data visualization and layout.
 */

import React from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader,
  CardTitle 
} from '@progress/kendo-react-layout';
import { 
  Grid, 
  GridColumn 
} from '@progress/kendo-react-grid';
import { 
  Chart, 
  ChartSeries, 
  ChartSeriesItem,
  ChartTitle
} from '@progress/kendo-react-charts';
import { useAuthStore } from '@/store/auth.store';
import { useProducts, useProductStats } from '@/queries';
import LoadingSpinner from '@/components/common/LoadingSpinner/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { user, hasAnyRole } = useAuthStore();
  
  // Fetch recent products using React Query
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError 
  } = useProducts(
    { ordering: '-created_at' },
    { page: 1, page_size: 5 }
  );

  // Fetch stats if user is admin or manager
  const { 
    data: stats, 
    isLoading: statsLoading
  } = useProductStats(hasAnyRole(['admin', 'manager']));

  const recentProducts = productsData?.results || [];
  const loading = productsLoading || (hasAnyRole(['admin', 'manager']) && statsLoading);

  // Sample chart data
  const chartData = [
    { category: 'Published', value: stats?.published_products || 0 },
    { category: 'Draft', value: stats?.draft_products || 0 },
    { category: 'Featured', value: stats?.featured_products || 0 },
  ];

  const renderWelcomeSection = () => (
    <div className="dashboard-welcome">
      <h1>Welcome back, {user?.first_name || user?.username}!</h1>
      <p>Here's what's happening with your business today.</p>
    </div>
  );

  const renderStatsCards = () => {
    if (!hasAnyRole(['admin', 'manager']) || !stats) {
      return null;
    }

    const statCards = [
      {
        title: 'Total Products',
        value: stats.total_products,
        icon: '📦',
        color: 'primary',
      },
      {
        title: 'Published',
        value: stats.published_products,
        icon: '✅',
        color: 'success',
      },
      {
        title: 'Draft',
        value: stats.draft_products,
        icon: '📝',
        color: 'warning',
      },
      {
        title: 'Low Stock',
        value: stats.low_stock_products,
        icon: '⚠️',
        color: 'danger',
      },
    ];

    return (
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <Card key={index} className={`stat-card stat-card-${stat.color}`}>
            <CardBody>
              <div className="stat-content">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-details">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-title">{stat.title}</div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  };

  const renderChart = () => {
    if (!hasAnyRole(['admin', 'manager']) || !stats) {
      return null;
    }

    return (
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Product Distribution</CardTitle>
        </CardHeader>
        <CardBody>
          <Chart style={{ height: '300px' }}>
            <ChartTitle text="Products by Status" />
            <ChartSeries>
              <ChartSeriesItem
                type="donut"
                data={chartData}
                field="value"
                categoryField="category"
              />
            </ChartSeries>
          </Chart>
        </CardBody>
      </Card>
    );
  };

  const renderRecentProducts = () => (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle>Recent Products</CardTitle>
      </CardHeader>
      <CardBody>
        {loading ? (
          <LoadingSpinner message="Loading recent products..." />
        ) : recentProducts.length > 0 ? (
          <Grid data={recentProducts} style={{ height: '300px' }}>
            <GridColumn field="name" title="Product Name" width="200px" />
            <GridColumn field="category.name" title="Category" width="150px" />
            <GridColumn 
              field="price" 
              title="Price" 
              width="100px"
            />
            <GridColumn 
              field="stock_quantity" 
              title="Stock" 
              width="80px"
            />
            <GridColumn 
              field="status" 
              title="Status" 
              width="100px"
            />
          </Grid>
        ) : (
          <div className="empty-state">
            <p>No products found</p>
          </div>
        )}
      </CardBody>
    </Card>
  );

  const renderQuickActions = () => (
    <Card className="dashboard-card quick-actions-card">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="quick-actions">
          <button 
            className="quick-action-btn"
            onClick={() => window.location.href = '/products/create'}
          >
            <span className="action-icon">➕</span>
            <span>Add Product</span>
          </button>
          
          <button 
            className="quick-action-btn"
            onClick={() => window.location.href = '/products'}
          >
            <span className="action-icon">📦</span>
            <span>View Products</span>
          </button>
          
          {hasAnyRole(['admin', 'manager']) && (
            <button 
              className="quick-action-btn"
              onClick={() => window.location.href = '/categories'}
            >
              <span className="action-icon">📂</span>
              <span>Manage Categories</span>
            </button>
          )}
          
          <button 
            className="quick-action-btn"
            onClick={() => window.location.href = '/profile'}
          >
            <span className="action-icon">👤</span>
            <span>Edit Profile</span>
          </button>
        </div>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <div className="dashboard-page">
        <LoadingSpinner size="large" message="Loading dashboard..." />
      </div>
    );
  }

  // Show error state if there are critical errors
  if (productsError) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <h2>Error loading dashboard</h2>
          <p>Unable to load recent products. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {renderWelcomeSection()}
      
      {renderStatsCards()}
      
      <div className="dashboard-grid">
        <div className="dashboard-main">
          {renderChart()}
          {renderRecentProducts()}
        </div>
        
        <div className="dashboard-sidebar">
          {renderQuickActions()}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

