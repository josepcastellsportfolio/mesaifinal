/**
 * Product Detail page component
 * Displays detailed information about a specific product
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button 
} from '@progress/kendo-react-buttons';
import { 
  Card, 
  CardBody 
} from '@progress/kendo-react-layout';
import TagBadge from '@/components/common/TagBadge/TagBadge';
import { useProduct, useDeleteProduct } from '@/queries';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES, USER_ROLES } from '@/constants';
import './ProductDetailPage.css';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { hasAnyRole } = useAuthStore();
  
  // ===== STATE MANAGEMENT =====
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // ===== DATA FETCHING =====
  const { 
    data: product, 
    isLoading, 
    error 
  } = useProduct(slug || '');

  console.log('Product detail:', product);
  

  // ===== MUTATIONS =====
  const deleteProductMutation = useDeleteProduct();

  // ===== PERMISSION CHECKS =====
  const canEditProducts = hasAnyRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]);
  const canDeleteProducts = hasAnyRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]);

  // ===== EVENT HANDLERS =====
  
  /**
   * Navigate back to products list
   */
  const handleBackToProducts = () => {
    navigate(ROUTES.PRODUCTS);
  };

  /**
   * Navigate to edit product form
   */
  const handleEditProduct = () => {
    if (product) {
      navigate(ROUTES.PRODUCT_EDIT.replace(':slug', product.slug));
    }
  };

  /**
   * Show delete confirmation dialog
   */
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  /**
   * Close delete confirmation dialog
   */
  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
  };

  /**
   * Confirm and execute product deletion
   */
  const handleConfirmDelete = async () => {
    if (product) {
      try {
        await deleteProductMutation.mutateAsync(product.slug);
        // Navigate back to products list after successful deletion
        navigate(ROUTES.PRODUCTS);
      } catch (error) {
        console.error('Failed to delete product:', error);
        // Dialog will close automatically, user can try again
      }
    }
  };

  // ===== LOADING STATE =====
  if (isLoading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-message">Loading product details...</p>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <h2>Product Not Found</h2>
          <p>{error?.message || 'The requested product could not be found.'}</p>
          <Button onClick={handleBackToProducts} themeColor="primary">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  // ===== UTILITY FUNCTIONS =====
  const getStockStatus = () => {
    if (product.stock_quantity === 0) return 'out-of-stock';
    if (product.stock_quantity <= 10) return 'low-stock';
    return 'in-stock';
  };

  const getStockText = () => {
    if (product.stock_quantity === 0) return 'Out of Stock';
    if (product.stock_quantity <= 10) return 'Low Stock';
    return 'In Stock';
  };

  // ===== RENDER =====
  return (
    <div className="product-detail-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="breadcrumb">
            <button 
              className="breadcrumb-link" 
              onClick={handleBackToProducts}
            >
              Products
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{product.name}</span>
          </div>
          <h1>{product.name}</h1>
          <div className="product-meta">
            <span className="product-sku">SKU: {product.sku}</span>
            <span className={`status-badge status-${product.status}`}>
              {product.status}
            </span>
            {product.is_featured && (
              <span className="featured-badge">⭐ Featured</span>
            )}
          </div>
        </div>
        <div className="header-actions">
          {canEditProducts && (
            <Button 
              onClick={handleEditProduct}
              themeColor="primary"
              size="large"
            >
              ✏️ Edit Product
            </Button>
          )}
                     {canDeleteProducts && (
             <Button 
               onClick={handleDeleteClick}
               themeColor="error"
               size="large"
               className="delete-button"
             >
               🗑️ Delete Product
             </Button>
           )}
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">
        <div className="product-details-grid">
          {/* Main Information */}
          <Card className="main-info-card">
            <CardBody>
              <h3>Product Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name</label>
                  <span>{product.name}</span>
                </div>
                <div className="info-item">
                  <label>SKU</label>
                  <span className="sku-value">{product.sku}</span>
                </div>
                <div className="info-item">
                  <label>Tags</label>
                  <span>
                    {product.tags && product.tags.length > 0
                      ? product.tags.map(tag => (
                          <TagBadge key={tag.id} tag={tag} />
                        ))
                      : <span>No tags</span>
                    }
                  </span>
                </div>
                <div className="info-item">
                  <label>Category</label>
                  <span>{product.category?.name || 'Uncategorized'}</span>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <span className={`status-badge status-${product.status}`}>
                    {product.status}
                  </span>
                </div>
              </div>

              {product.description && (
                <div className="description-section">
                  <label>Description</label>
                  <div className="description-content">
                    {product.description}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Pricing & Inventory */}
          <Card className="pricing-card">
            <CardBody>
              <h3>Pricing & Inventory</h3>
              <div className="pricing-grid">
                <div className="price-item">
                  <label>Price</label>
                  <span className="price-value">${product.price}</span>
                </div>
                <div className="stock-item">
                  <label>Stock Quantity</label>
                  <div className="stock-info">
                    <span className="price-value">{product.stock_quantity}</span>
                    <span className={`stock-status ${getStockStatus()}`}>
                      {getStockText()}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Metadata */}
          <Card className="metadata-card">
            <CardBody>
              <h3>Metadata</h3>
              <div className="metadata-grid">
                <div className="metadata-item">
                  <label>Created</label>
                  <span>{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
                <div className="metadata-item">
                  <label>Last Updated</label>
                  <span>{new Date(product.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="metadata-item">
                  <label>Featured</label>
                  <span>{product.is_featured ? 'Yes' : 'No'}</span>
                </div>
                <div className="metadata-item">
                  <label>Slug</label>
                  <span className="slug-value">{product.slug}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteDialog && (
        <div className="modal-overlay" onClick={handleCloseDeleteDialog}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Product</h3>
              <button 
                className="modal-close" 
                onClick={handleCloseDeleteDialog}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete <strong>"{product.name}"</strong>?
              </p>
              <p className="delete-warning">
                ⚠️ This action cannot be undone. The product will be permanently removed from the system.
              </p>
            </div>
            <div className="modal-footer">
              <Button
                onClick={handleCloseDeleteDialog}
                themeColor="secondary"
              >
                Cancel
              </Button>
                             <Button
                 onClick={handleConfirmDelete}
                 themeColor="error"
                 disabled={deleteProductMutation.isPending}
               >
                 {deleteProductMutation.isPending ? 'Deleting...' : 'Delete Product'}
               </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
