import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { useCategory, useDeleteCategory } from '@/queries';
import { ROUTES } from '@/constants';
import './CategoriesDetail.css';

const CategoriesDetail: React.FC = () => {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { data: category, isLoading, error } = useCategory(slug, !!slug);
  const deleteMutation = useDeleteCategory();

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
  };

  const handleConfirmDelete = () => {
    if (!slug) return;
    deleteMutation.mutate(slug, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        navigate(ROUTES.CATEGORIES);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <h2>Loading category...</h2>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>Failed to load category</h2>
          <p>The category you're looking for doesn't exist or there was an error loading it.</p>
          <Button onClick={() => navigate(ROUTES.CATEGORIES)}>Back to Categories</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <div className="breadcrumb">
            <button 
              className="breadcrumb-link" 
              onClick={() => navigate(ROUTES.CATEGORIES)}
            >
              Categories
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{category.name}</span>
          </div>
          <h1>{category.name}</h1>
          <div className="category-meta">
            <span className="category-slug">Slug: {category.slug}</span>
            <span className={`status-badge ${category.is_active ? 'active' : 'inactive'}`}>
              {category.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <Button onClick={() => navigate(ROUTES.CATEGORIES)}>Back</Button>
          <Button 
            themeColor="secondary" 
            onClick={() => navigate(ROUTES.CATEGORY_EDIT.replace(':slug', slug))} 
            style={{ marginLeft: 8 }}
          >
            Edit
          </Button>
          <Button 
            themeColor="error" 
            onClick={handleDeleteClick} 
            style={{ marginLeft: 8 }}
            className="delete-button"
          >
            🗑️ Delete Category
          </Button>
        </div>
      </div>

      <div className="page-content">
        <div className="category-details-grid">
          {/* Main Info Card */}
          <Card className="main-info-card">
            <CardBody>
              <h3>Category Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name</label>
                  <span>{category.name}</span>
                </div>
                <div className="info-item">
                  <label>Slug</label>
                  <span className="slug-value">{category.slug}</span>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <span className={`status-badge ${category.is_active ? 'active' : 'inactive'}`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Sort Order</label>
                  <span>{category.sort_order}</span>
                </div>
                {category.parent && (
                  <div className="info-item">
                    <label>Parent Category</label>
                    <span>{category.parent}</span>
                  </div>
                )}
              </div>

              {category.description && (
                <div className="description-section">
                  <label>Description</label>
                  <div className="description-content">
                    {category.description}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Statistics Card */}
          <Card className="stats-card">
            <CardBody>
              <h3>Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <label>Total Products</label>
                  <span className="stat-value">{category.product_count}</span>
                </div>
                <div className="stat-item">
                  <label>Created</label>
                  <span>{new Date(category.created_at).toLocaleDateString()}</span>
                </div>
                <div className="stat-item">
                  <label>Last Updated</label>
                  <span>{new Date(category.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Hierarchy Card */}
          {category.children && category.children.length > 0 && (
            <Card className="hierarchy-card">
              <CardBody>
                <h3>Subcategories</h3>
                <div className="children-list">
                  {category.children.map((child) => (
                    <div key={child.id} className="child-item">
                      <span className="child-name">{child.name}</span>
                      <span className="child-products">({child.product_count} products)</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteDialog && (
        <div className="modal-overlay" onClick={handleCloseDeleteDialog}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Category</h3>
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
                Are you sure you want to delete <strong>"{category.name}"</strong>?
              </p>
              <p className="delete-warning">
                ⚠️ This action cannot be undone. The category will be permanently removed from the system.
              </p>
              {category.product_count > 0 && (
                <p className="delete-warning">
                  ⚠️ This category contains {category.product_count} products. Deleting it may affect those products.
                </p>
              )}
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
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Category'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesDetail;


