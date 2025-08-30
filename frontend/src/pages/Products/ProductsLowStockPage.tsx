import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { useProducts } from '@/queries';
import { ROUTES } from '@/constants';
import SearchBar from '@/components/common/SearchBar/SearchBar';
import DataTable from '@/components/common/DataTable/DataTable';
import type { TableColumn, TableAction } from '@/components/common/DataTable/DataTable';

const ProductsLowStockPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Query for low stock products (assuming stock_quantity < 10 is low stock)
  const { data: productsData, isLoading } = useProducts({
    search: searchTerm,
    stock_quantity__lt: 10,
    stock_quantity__gt: 0, // Exclude out of stock
    ordering: 'stock_quantity',
  }, {
    page,
    page_size: pageSize,
  });

  const products = productsData?.results || [];
  const total = productsData?.count || 0;

  // Table Configuration
  const columns: TableColumn[] = [
    {
      field: 'name',
      title: 'Product',
      width: 250,
      cell: (props) => (
        <div className="product-name-cell">
          <strong>{props.dataItem.name}</strong>
          <div className="product-sku">SKU: {props.dataItem.sku}</div>
        </div>
      ),
    },
    {
      field: 'stock_quantity',
      title: 'Stock',
      width: 100,
      cell: (props) => (
        <div className={`stock-cell ${props.dataItem.stock_quantity < 5 ? 'critical' : 'low'}`}>
          <span className="stock-number">{props.dataItem.stock_quantity}</span>
          <span className="stock-label">units</span>
        </div>
      ),
    },
    {
      field: 'category',
      title: 'Category',
      width: 150,
      cell: (props) => <span>{props.dataItem.category.name}</span>,
    },
    {
      field: 'price',
      title: 'Price',
      width: 100,
      cell: (props) => <span>${props.dataItem.price}</span>,
    },
    {
      field: 'status',
      title: 'Status',
      width: 100,
      cell: (props) => (
        <span className={`status-badge ${props.dataItem.status}`}>
          {props.dataItem.status}
        </span>
      ),
    },
  ];

  const actions: TableAction[] = [
    {
      label: 'View',
      onClick: (product: Record<string, unknown>) => navigate(`/products/${product.slug}`),
      themeColor: 'primary',
    },
    {
      label: 'Edit',
      onClick: (product: Record<string, unknown>) => {
        const editData = encodeURIComponent(JSON.stringify(product));
        navigate(`/products/create?edit=${editData}`);
      },
      themeColor: 'secondary',
    },
  ];

  return (
    <div className="low-stock-page">
      <div className="page-header">
        <div className="header-content">
          <h1>⚠️ Low Stock Products</h1>
          <p>Products with low inventory levels that need attention</p>
          <div className="alert-summary">
            <span className="alert-count">{total} products need restocking</span>
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
            onClick={() => navigate(ROUTES.PRODUCTS_STATS)}
            themeColor="info"
            size="large"
          >
            📊 View Stats
          </Button>
        </div>
      </div>

      <div className="page-content">
        <div className="search-section">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={() => setPage(1)}
            placeholder="Search low stock products..."
          />
        </div>

        <Card>
          <CardBody>
            <DataTable
              data={products as unknown as Record<string, unknown>[]}
              columns={columns}
              actions={actions}
              loading={isLoading}
              total={total}
              page={page} 
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ProductsLowStockPage;
