import React from 'react';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { Badge } from '@progress/kendo-react-indicators';
import type { Review } from '@/types';
import './ReviewCard.css';

export interface ReviewCardProps {
  review: Review;
  onView?: (review: Review) => void;
  onEdit?: (review: Review) => void;
  onApprove?: (review: Review) => void;
  onReject?: (review: Review) => void;
  onMarkHelpful?: (review: Review) => void;
  showActions?: boolean;
  showProduct?: boolean;
  className?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onView,
  onEdit,
  onApprove,
  onReject,
  onMarkHelpful,
  showActions = true,
  showProduct = true,
  className = "",
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const getApprovalStatus = () => {
    if (review.is_approved) {
      return { label: 'Approved', color: 'success' as const };
    }
    return { label: 'Pending', color: 'warning' as const };
  };

  const approvalStatus = getApprovalStatus();

  return (
    <Card className={`review-card ${className}`}>
      <CardBody>
        <div className="review-header">
          <div className="review-info">
            <div className="rating-section">
              <div className="stars">
                {renderStars(review.rating)}
              </div>
              <span className="rating-text">({review.rating}/5)</span>
            </div>
            <h4 className="review-title">{review.title}</h4>
          </div>
          <div className="review-badges">
            <Badge themeColor={approvalStatus.color} size="small">
              {approvalStatus.label}
            </Badge>
            {review.is_verified_purchase && (
              <Badge themeColor="info" size="small">
                ✓ Verified Purchase
              </Badge>
            )}
          </div>
        </div>

        <div className="review-content">
          <p className="review-text">{review.content}</p>
        </div>

        <div className="review-meta">
          <div className="reviewer-info">
            <span className="reviewer-name">By {review.user_name}</span>
            <span className="review-date">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
          
          {showProduct && (
            <div className="product-info">
              <span className="product-label">Product:</span>
              <span className="product-name">{review.product_name}</span>
            </div>
          )}
        </div>

        {review.helpful_votes > 0 && (
          <div className="helpful-votes">
            <span className="helpful-text">
              {review.helpful_votes} people found this helpful
            </span>
          </div>
        )}

        {showActions && (
          <div className="review-actions">
            <div className="primary-actions">
              {onView && (
                <Button
                  onClick={() => onView(review)}
                  themeColor="primary"
                  fillMode="outline"
                  size="small"
                >
                  View
                </Button>
              )}
              {onEdit && (
                <Button
                  onClick={() => onEdit(review)}
                  themeColor="secondary"
                  fillMode="outline"
                  size="small"
                >
                  Edit
                </Button>
              )}
              {onMarkHelpful && (
                <Button
                  onClick={() => onMarkHelpful(review)}
                  themeColor="info"
                  fillMode="flat"
                  size="small"
                  title="Mark as helpful"
                >
                  👍 Helpful
                </Button>
              )}
            </div>
            
            {!review.is_approved && (
              <div className="approval-actions">
                {onApprove && (
                  <Button
                    onClick={() => onApprove(review)}
                    themeColor="success"
                    size="small"
                  >
                    ✓ Approve
                  </Button>
                )}
                {onReject && (
                  <Button
                    onClick={() => onReject(review)}
                    themeColor="error"
                    fillMode="outline"
                    size="small"
                  >
                    ✗ Reject
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ReviewCard;
