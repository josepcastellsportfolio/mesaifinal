import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { Badge } from '@progress/kendo-react-indicators';
import { useReview, useApproveReview, useRejectReview, useMarkReviewHelpful } from '@/queries';
import { ROUTES } from '@/constants';

const ReviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reviewId = id ? parseInt(id) : 0;

  const { data: review, isLoading, error } = useReview(reviewId);
  const approveReviewMutation = useApproveReview();
  const rejectReviewMutation = useRejectReview();
  const markHelpfulMutation = useMarkReviewHelpful();
  const [helpfulSuccess, setHelpfulSuccess] = React.useState(false);

  const handleEdit = () => {
    navigate(`/reviews/${reviewId}/edit`);
  };

  const handleApprove = async () => {
    if (review && !review.is_approved) {
      try {
        await approveReviewMutation.mutateAsync(reviewId);
      } catch (error) {
        console.error('Failed to approve review:', error);
      }
    }
  };

  const handleReject = async () => {
    if (review && !review.is_approved) {
      try {
        await rejectReviewMutation.mutateAsync(reviewId);
      } catch (error) {
        console.error('Failed to reject review:', error);
      }
    }
  };

  const handleMarkHelpful = async () => {
    try {
      await markHelpfulMutation.mutateAsync(reviewId);
      setHelpfulSuccess(true);
      // Optionally, refetch the review to update helpful_votes
      // queryClient.invalidateQueries(['review', reviewId]);
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'star filled' : 'star empty'}>
        ★
      </span>
    ));
  };

  if (isLoading) {
    return (
      <div className="review-detail-page">
        <div className="loading-state">Loading review details...</div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="review-detail-page">
        <div className="error-state">
          <h2>Review Not Found</h2>
          <p>The requested review could not be found.</p>
          <Button onClick={() => navigate(ROUTES.REVIEWS)} themeColor="primary">
            Back to Reviews
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-detail-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Review Details</h1>
          <p>Review by {review.user_name} for {review.product_name}</p>
        </div>
        
        <div className="header-actions">
          <Button
            onClick={() => navigate(ROUTES.REVIEWS)}
            fillMode="outline"
            size="large"
          >
            ← Back to Reviews
          </Button>
          <Button
            onClick={handleEdit}
            themeColor="secondary"
            size="large"
          >
            ✏️ Edit Review
          </Button>
        </div>
      </div>

      <div className="page-content">
        <Card>
          <CardBody>
            <div className="review-content">
              <div className="review-header">
                <div className="rating-section">
                  <div className="stars">
                    {renderStars(review.rating)}
                  </div>
                  <span className="rating-text">({review.rating}/5)</span>
                </div>
                
                <div className="review-badges">
                  <Badge themeColor={review.is_approved ? 'success' : 'warning'}>
                    {review.is_approved ? 'Approved' : 'Pending'}
                  </Badge>
                  {review.is_verified_purchase && (
                    <Badge themeColor="info">✓ Verified Purchase</Badge>
                  )}
                </div>
              </div>

              <h2 className="review-title">{review.title}</h2>
              
              <div className="review-text">
                <p>{review.content}</p>
              </div>

              <div className="review-meta">
                <div className="reviewer-info">
                  <strong>Reviewer:</strong> {review.user_name}
                </div>
                <div className="product-info">
                  <strong>Product:</strong> {review.product_name}
                </div>
                <div className="date-info">
                  <strong>Date:</strong> {new Date(review.created_at).toLocaleDateString()}
                </div>
                {review.helpful_votes > 0 && (
                  <div className="helpful-info">
                    <strong>Helpful votes:</strong> {review.helpful_votes}
                  </div>
                )}
              </div>

              <div className="review-actions">
                {!review.is_approved && (
                  <div className="approval-actions">
                    <Button
                      onClick={handleApprove}
                      themeColor="success"
                      disabled={approveReviewMutation.isPending}
                    >
                      ✓ Approve Review
                    </Button>
                    <Button
                      onClick={handleReject}
                      themeColor="error"
                      fillMode="outline"
                      disabled={rejectReviewMutation.isPending}
                    >
                      ✗ Reject Review
                    </Button>
                  </div>
                )}
                
                  <Button
                    onClick={handleMarkHelpful}
                    themeColor="info"
                    fillMode="flat"
                    disabled={markHelpfulMutation.isPending || helpfulSuccess}
                  >
                    👍 Mark as Helpful
                  </Button>
                  {helpfulSuccess && (
                    <span style={{ marginLeft: 8, color: 'green' }}>
                      Thank you for your feedback!
                    </span>
                  )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ReviewDetail;
