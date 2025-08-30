import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Kendo imports removed
import { useTag, useDeleteTag, useProducts } from '@/queries';
import { ROUTES } from '@/constants';
import ProductCard from '@/components/common/ProductCard/ProductCard';
import TagBadge from '@/components/common/TagBadge/TagBadge';
import './TagDetail.css';
import type { Product } from '@/types';
import { Button } from '@progress/kendo-react-buttons';
import { Badge } from '@progress/kendo-react-indicators';
import { Card, CardBody } from '@progress/kendo-react-layout';

const TagDetail: React.FC = () => {
   const { slug } = useParams();
  const navigate = useNavigate();
  const tagSlug = slug || '';

  // Queries and Mutations
  const { data: tag, isLoading: isLoadingTag, error: tagError } = useTag(tagSlug);

  // Cambia aquí: usa tag?.id si existe, si no, un array vacío (para evitar NaN)
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    tags: tag?.id ? [tag.id] : [],
    page_size: 12,
  });
  const deleteTagMutation = useDeleteTag();

  const products = productsData?.results || [];

  // Event Handlers
  const handleEdit = () => {
    navigate(`/tags/${slug}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      try {
        await deleteTagMutation.mutateAsync(tagSlug);
        navigate(ROUTES.TAGS);
      } catch (error) {
        console.error('Failed to delete tag:', error);
      }
    }
  };

  const handleViewProduct = (product: Product) => {
    navigate(`/products/${product.slug}`);
  };

  const handleEditProduct = (product: Product) => {
    const editData = encodeURIComponent(JSON.stringify(product));
    navigate(`/products/create?edit=${editData}`);
  };

  // Loading state
  if (isLoadingTag) {
    return (
      <div className="tag-detail-page">
        <div className="loading-state">Loading tag details...</div>
      </div>
    );
  }

  // Error state
  if (tagError || !tag) {
    return (
      <div className="tag-detail-page">
        <div className="error-state">
          <h2>Tag Not Found</h2>
          <p>The requested tag could not be found.</p>
          <Button onClick={() => navigate(ROUTES.TAGS)} themeColor="primary">
            Back to Tags
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="tag-detail-page">
      <div className="page-header">
        <div className="header-content">
          <div className="tag-info">
            <TagBadge tag={tag} size="large" className="main-tag-badge" />
            <div className="tag-details">
              <h1>{tag.name}</h1>
              <div className="tag-meta">
                <Badge 
                  themeColor={tag.is_active ? 'success' : 'error'} 
                  size="medium"
                >
                  {tag.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <span className="product-count">
                  {tag.product_count} products
                </span>
                <span className="created-date">
                  Created: {new Date(tag.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <Button
            onClick={() => navigate(ROUTES.TAGS)}
            fillMode="outline"
            size="large"
          >
            ← Back to Tags
          </Button>
          <Button
            onClick={handleEdit}
            themeColor="secondary"
            size="large"
          >
            ✏️ Edit Tag
          </Button>
          <Button
            onClick={handleDelete}
            themeColor="error"
            size="large"
            disabled={deleteTagMutation.isPending}
          >
            🗑️ Delete
          </Button>
        </div>
      </div>

      <div className="page-content">
        <div className="content-sections">
          {/* Tag Statistics */}
          <Card className="stats-card">
            <CardBody>
              <h3>Tag Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{tag.product_count}</div>
                  <div className="stat-label">Total Products</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{tag.is_active ? 'Active' : 'Inactive'}</div>
                  <div className="stat-label">Status</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{tag.color}</div>
                  <div className="stat-label">Color Code</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {new Date(tag.created_at).toLocaleDateString()}
                  </div>
                  <div className="stat-label">Created</div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Products with this Tag */}
           <Card className="products-card">
        <CardBody>
          <div className="section-header">
            <h3>Products with this Tag</h3>
            {tag.product_count > 0 && (
              <Button
                // Cambia aquí también: usa tag.id
                onClick={() => navigate(`/products?tags=${tag.id}`)}
                fillMode="outline"
                size="small"
              >
                View All Products
              </Button>
            )}
          </div>

          {isLoadingProducts ? (
            <div className="loading-products">Loading products...</div>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={handleViewProduct}
                  onEdit={handleEditProduct}
                  showActions={true}
                  className="product-card"
                />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>No products are currently tagged with "{tag.name}".</p>
              <Button
                onClick={() => navigate(ROUTES.PRODUCT_CREATE)}
                themeColor="primary"
                size="medium"
              >
                Create First Product
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
        </div>
      </div>
    </div>
  );
};

export default TagDetail;
