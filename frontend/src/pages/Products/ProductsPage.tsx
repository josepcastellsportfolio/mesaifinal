/**
 * ProductsPage Component
 * 
 * Manages the display and interaction with products in a table format.
 * Features:
 * - Search and filter products
 * - Row selection for editing
 * - Clickable product names for viewing details
 * - Visual feedback for selected rows
 * - Role-based permissions for create/edit operations
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, 
  GridColumn 
} from '@progress/kendo-react-grid';
import { 
  Button 
} from '@progress/kendo-react-buttons';
import { 
  Input 
} from '@progress/kendo-react-inputs';
import { useProducts } from '@/queries';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES, USER_ROLES, PAGINATION } from '@/constants';
import type { Product } from '@/types';
import type { InputChangeEvent } from '@progress/kendo-react-inputs';
import type { GridCellProps, GridSelectionChangeEvent } from '@progress/kendo-react-grid';

// Extended interface for products with category_name field
interface ProductWithCategoryName extends Product {
  category_name?: string;
}
import './ProductsPage.css';

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuthStore();
  
  // ===== STATE MANAGEMENT =====
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);

  // ===== DATA FETCHING =====
  const { 
    data: productsData, 
    isLoading, 
    error,
    refetch 
  } = useProducts(
    { 
      search: searchTerm || undefined,
      ordering: '-created_at'
    },
    { 
      page, 
      page_size: PAGINATION.DEFAULT_PAGE_SIZE 
    }
  );
  
  const products = productsData?.results || [];
  const totalCount = productsData?.count || 0;
  
  // Debug logs for products data
  React.useEffect(() => {
    if (products.length > 0) {
      console.log('🔍 [ProductsPage] Products data loaded:', products);
      const mesaProduct = products.find((p: Product) => p.slug === 'mesa');
      if (mesaProduct) {
        console.log('🔍 [ProductsPage] Mesa product found:', mesaProduct);
        console.log('🔍 [ProductsPage] Mesa product full data:', mesaProduct);
      }
    }
  }, [products]);

  // ===== PERMISSION CHECKS =====
  const canCreateProducts = hasAnyRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]);
  const canEditProducts = hasAnyRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]);

  // ===== EVENT HANDLERS =====
  
  /**
   * Handle row selection in the grid
   */
  const handleRowSelect = (event: GridSelectionChangeEvent) => {
    if (event?.dataItem?.id) {
      const selectedId = event.dataItem.id;
      setSelectedRows([selectedId]);
      setSelectedItem(event.dataItem as Product);
    } else if (event?.dataItems && event.dataItems.length > 0) {
      const selectedIds = event.dataItems.map((item: Record<string, unknown>) => item.id as number);
      setSelectedRows(selectedIds);
      setSelectedItem(event.dataItems[0] as Product);
    } else {
      setSelectedRows([]);
      setSelectedItem(null);
    }
  };

  /**
   * Handle search input changes
   */
  const handleSearch = (event: InputChangeEvent) => {
    setSearchTerm(String(event.target.value || ''));
    setPage(1); // Reset to first page when searching
  };

  /**
   * Navigate to create product form
   */
  const handleCreateProduct = () => {
    navigate(ROUTES.PRODUCT_CREATE);
  };

  /**
   * Navigate to product details page
   */
  const handleViewProduct = (product: Product) => {
    navigate(ROUTES.PRODUCT_DETAIL.replace(':slug', product.slug));
  };

  /**
   * Navigate to edit form with selected product data
   */
  const handleEditSelectedProduct = () => {
    if (selectedItem) {
      navigate(ROUTES.PRODUCT_EDIT.replace(':slug', selectedItem.slug));
    }
  };

  /**
   * Handle clicking on product name cell (navigate to details)
   */
  const handleNameClick = (product: Product) => {
    handleViewProduct(product);
  };

  // ===== DATA PREPARATION =====
  
  /**
   * Prepare products data with selection state for grid display
   */
  const productsWithSelection = products.map((product: Product) => ({
    ...product,
    className: selectedRows.includes(product.id) ? 'selected-row' : ''
  }));

  // ===== ERROR HANDLING =====
  if (error) {
    return (
      <div className="products-page">
        <div className="error-container">
          <h2>Error Loading Products</h2>
          <p>{error.message}</p>
          <Button onClick={() => refetch()} themeColor="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <div className="products-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Products</h1>
          <p>
            Manage your product catalog
            {selectedRows.length === 1 && (
              <span className="selection-indicator">
                • {selectedItem?.name || 'Selected product'} is selected
              </span>
            )}
          </p>
        </div>
        <div className="header-actions">
          {selectedRows.length === 1 && canEditProducts ? (
            <Button 
              onClick={handleEditSelectedProduct}
              themeColor="success"
              size="large"
              className="edit-selected-button"
            >
              ✏️ Edit Selected Product
            </Button>
          ) : (
            canCreateProducts && (
              <Button 
                onClick={handleCreateProduct}
                themeColor="primary"
                size="large"
              >
                ➕ Create Product
              </Button>
            )
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">
        {/* Search Toolbar */}
        <div className="content-toolbar">
          <div className="search-container">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              style={{ width: '300px' }}
            />
          </div>
          <div className="toolbar-info">
            <span className="results-count">
              {totalCount} product{totalCount !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        {/* Products Table */}
        <div className="content-main">
          <Grid
            data={isLoading ? [] : productsWithSelection}
            pageable={{
              buttonCount: 5,
              pageSizes: [...PAGINATION.PAGE_SIZE_OPTIONS],
            }}
            filterable={false}
            style={{ height: '600px' }}
            navigatable={true}
            resizable={false}
            selectable={{
              mode: 'single'
            }}
            onSelectionChange={handleRowSelect}
          >
            {/* Product Name Column */}
            <GridColumn 
              field="name" 
              title="Name" 
              width="250px"
              cells={{
                data: (props: GridCellProps) => (
                  <td 
                    className="product-name-cell clickable"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNameClick(props.dataItem as Product);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="product-name-content">
                      <strong>{props.dataItem.name}</strong>
                      <div className="product-sku">{props.dataItem.sku}</div>
                    </div>
                  </td>
                )
              }}
            />
            
                         {/* Category Column */}
             <GridColumn 
               field="category.name" 
               title="Category" 
               width="150px"
               cells={{
                 data: (props: GridCellProps) => {
                   const productWithCategory = props.dataItem as ProductWithCategoryName;
                   console.log('🔍 [ProductsPage] Category cell data for', props.dataItem.name, ':', {
                     category: props.dataItem.category,
                     category_name: productWithCategory.category_name,
                     fullDataItem: props.dataItem
                   });
                   return (
                     <td className="product-category-cell">
                       {productWithCategory.category_name || props.dataItem.category?.name || 'No Category'}
                     </td>
                   );
                 }
               }}
             />
            
            {/* Price Column */}
            <GridColumn 
              field="price" 
              title="Price" 
              width="120px"
              cells={{
                data: (props: GridCellProps) => (
                  <td>${props.dataItem.price}</td>
                )
              }}
            />
            
            {/* Stock Column */}
            <GridColumn 
              field="stock_quantity" 
              title="Stock" 
              width="100px"
              cells={{
                data: (props: GridCellProps) => (
                  <td>
                    <span 
                      className={`stock-badge ${
                        props.dataItem.stock_quantity === 0 
                          ? 'out-of-stock' 
                          : props.dataItem.stock_quantity <= 10 
                          ? 'low-stock' 
                          : 'in-stock'
                      }`}
                    >
                      {props.dataItem.stock_quantity}
                    </span>
                  </td>
                )
              }}
            />
          
            {/* Status Column */}
            <GridColumn 
              field="status" 
              title="Status" 
              width="120px"
              cells={{
                data: (props: GridCellProps) => (
                  <td>
                    <span className={`status-badge status-${props.dataItem.status}`}>
                      {props.dataItem.status}
                    </span>
                  </td>
                )
              }}
            />
            
            {/* Featured Column */}
            <GridColumn 
              field="is_featured" 
              title="Featured" 
              width="100px"
              cells={{
                data: (props: GridCellProps) => (
                  <td>
                    {props.dataItem.is_featured ? (
                      <span className="featured-badge">⭐ Yes</span>
                    ) : (
                      <span className="not-featured">No</span>
                    )}
                  </td>
                )
              }}
            />
            
            {/* Created Date Column */}
            <GridColumn 
              field="created_at" 
              title="Created" 
              width="140px"
              cells={{
                data: (props: GridCellProps) => (
                  <td>
                    {new Date(props.dataItem.created_at).toLocaleDateString()}
                  </td>
                )
              }}
            />
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;