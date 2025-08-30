import React from 'react';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { Badge } from '@progress/kendo-react-indicators';
import type { Product } from '@/types';
import './ProductCard.css';

export interface ProductCardProps {
  product: Product;
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  showActions?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onView,
  onEdit,
  onDelete,
  showActions = true,
  className = "",
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStockStatus = (stockQuantity: number) => {
    if (stockQuantity === 0) return { label: 'Out of Stock', color: 'error' as const };
    if (stockQuantity < 10) return { label: 'Low Stock', color: 'warning' as const };
    return { label: 'In Stock', color: 'success' as const };
  };

  const stockStatus = getStockStatus(product.stock_quantity);

  return (
    <Card className={`product-card ${className}`}>
      <CardBody>
        <div className="product-card-header">
          <div className="product-info">
            <h3 className="product-name" onClick={() => onView?.(product)}>
              {product.name}
            </h3>
            <p className="product-sku">SKU: {product.sku}</p>
          </div>
          <div className="product-badges">
            {product.is_featured && (
              <Badge themeColor="warning" size="small">
                ⭐ Featured
              </Badge>
            )}
            <Badge themeColor={getStatusColor(product.status)} size="small">
              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="product-details">
          <div className="product-price">
            <span className="price-label">Price:</span>
            <span className="price-value">${product.price}</span>
          </div>
          
          <div className="product-stock">
            <span className="stock-label">Stock:</span>
            <span className={`stock-value stock-${stockStatus.color}`}>
              {product.stock_quantity} units
            </span>
            <Badge themeColor={stockStatus.color} size="small">
              {stockStatus.label}
            </Badge>
          </div>

          <div className="product-category">
            <span className="category-label">Category:</span>
            <span className="category-value">{product.category.name}</span>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="product-tags">
              {product.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  themeColor="info"
                  size="small"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
              {product.tags.length > 3 && (
                <span className="more-tags">+{product.tags.length - 3} more</span>
              )}
            </div>
          )}

          {product.description && (
            <p className="product-description">
              {product.description.length > 100
                ? `${product.description.substring(0, 100)}...`
                : product.description}
            </p>
          )}
        </div>

        {showActions && (
          <div className="product-actions">
            {onView && (
              <Button
                onClick={() => onView(product)}
                themeColor="primary"
                fillMode="outline"
                size="small"
              >
                View
              </Button>
            )}
            {onEdit && (
              <Button
                onClick={() => onEdit(product)}
                themeColor="secondary"
                fillMode="outline"
                size="small"
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => onDelete(product)}
                themeColor="error"
                fillMode="outline"
                size="small"
              >
                Delete
              </Button>
            )}
          </div>
        )}

        <div className="product-meta">
          <span className="created-date">
            Created: {new Date(product.created_at).toLocaleDateString()}
          </span>
          {product.average_rating && (
            <span className="rating">
              ⭐ {product.average_rating.toFixed(1)} ({product.review_count} reviews)
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default ProductCard;
