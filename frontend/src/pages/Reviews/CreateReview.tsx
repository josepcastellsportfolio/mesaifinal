import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, FormElement, Field } from '@progress/kendo-react-form';
import { Input, TextArea } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { useCreateReview, useUpdateReview, useReview, useProducts } from '@/queries';
import type { ReviewCreate } from '@/queries/reviews.queries';
import { ROUTES } from '@/constants';

const ratingOptions = [
  { text: '⭐ 1 Star - Poor', value: 1 },
  { text: '⭐⭐ 2 Stars - Fair', value: 2 },
  { text: '⭐⭐⭐ 3 Stars - Good', value: 3 },
  { text: '⭐⭐⭐⭐ 4 Stars - Very Good', value: 4 },
  { text: '⭐⭐⭐⭐⭐ 5 Stars - Excellent', value: 5 },
];

const CreateReview: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const reviewId = id ? parseInt(id) : null;

  // Queries and Mutations
  const { data: existingReview, isLoading: isLoadingReview } = useReview(reviewId!);
  const { data: productsData } = useProducts({}, { page: 1, page_size: 100 });
  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();

  const products = productsData?.results || [];

  // --- PRODUCT & RATING SELECTION STATE ---
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedRating, setSelectedRating] = useState<any>(ratingOptions[4]);

  // Sync selectedProduct and selectedRating with review (edit) or reset (create)
   useEffect(() => {
    if (isEditMode && existingReview && products.length > 0) {
      const foundProduct = products.find(p => p.id === existingReview.product);
      setSelectedProduct(foundProduct || null);

      const foundRating = ratingOptions.find(r => r.value === existingReview.rating);
      setSelectedRating(foundRating || ratingOptions[4]);
    } else if (!isEditMode) {
      setSelectedProduct(null);
      setSelectedRating(ratingOptions[4]);
    }
  }, [isEditMode, existingReview, products]);

  const getInitialFormData = () => ({
    title: isEditMode && existingReview ? existingReview.title : '',
    content: isEditMode && existingReview ? existingReview.content : '',
  });

  const handleSubmit = async (dataItem: Record<string, unknown>) => {
    const reviewData: ReviewCreate = {
      product: selectedProduct?.id ?? null,
      rating: selectedRating?.value ?? null,
      title: dataItem.title as string,
      content: dataItem.content as string,
    };

    if (!reviewData.product || !reviewData.rating) {
      alert('Please select a product and a rating.');
      return;
    }

    try {
      if (isEditMode && reviewId) {
        await updateReviewMutation.mutateAsync({ id: reviewId, data: reviewData });
        navigate(`/reviews/${reviewId}`);
      } else {
        const newReview = await createReviewMutation.mutateAsync(reviewData);
        navigate(`/reviews/${newReview.id}`);
      }
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} review:`, error);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.REVIEWS);
  };

  if (isEditMode && isLoadingReview) {
    return (
      <div className="create-review-page">
        <div className="loading-state">Loading review data...</div>
      </div>
    );
  }

  const pageTitle = isEditMode ? 'Edit Review' : 'Create New Review';
  const submitButtonText = isEditMode ? 'Update Review' : 'Create Review';

  return (
    <div className="create-review-page">
      <div className="page-header">
        <div className="header-content">
          <h1>{pageTitle}</h1>
          <p>{isEditMode ? 'Update review information' : 'Share your product experience'}</p>
        </div>
        <div className="header-actions">
          <Button
            onClick={handleCancel}
            fillMode="outline"
            size="large"
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="form-container">
        <Card>
          <CardBody>
            <Form
              initialValues={getInitialFormData()}
              onSubmit={handleSubmit}
              render={(formRenderProps) => (
                <FormElement>
                  <div className="form-section">
                    <h3>Review Details</h3>

                    <div className="form-field">
                      <label>Product *</label>
                      <Field
                        name="product"
                        component={(fieldProps) => (
                          <DropDownList
                            {...fieldProps}
                            data={products}
                            textField="name"
                            dataItemKey="id"
                            value={selectedProduct}
                            onChange={e => {
                              setSelectedProduct(e.value);
                              fieldProps.onChange(e.value?.id ?? null);
                            }}
                            defaultItem={{ name: 'Select a product', id: null }}
                          />
                        )}
                      />
                    </div>

                    <div className="form-field">
                      <label>Rating *</label>
                      <Field
                        name="rating"
                        component={(fieldProps) => (
                          <DropDownList
                            {...fieldProps}
                            data={ratingOptions}
                            textField="text"
                            dataItemKey="value"
                            value={selectedRating}
                            onChange={e => {
                              setSelectedRating(e.value);
                              fieldProps.onChange(e.value.value);
                            }}
                          />
                        )}
                      />
                    </div>

                    <div className="form-field">
                      <label>Review Title *</label>
                      <Field
                        name="title"
                        component={Input}
                        placeholder="Brief summary of your review"
                      />
                    </div>

                    <div className="form-field">
                      <label>Review Content *</label>
                      <Field
                        name="content"
                        component={TextArea}
                        placeholder="Share your detailed experience with this product..."
                        rows={6}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <Button
                      type="button"
                      onClick={handleCancel}
                      fillMode="outline"
                      size="large"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      themeColor="primary"
                      size="large"
                      disabled={
                        (isEditMode ? updateReviewMutation.isPending : createReviewMutation.isPending) ||
                        !formRenderProps.allowSubmit
                      }
                    >
                      {(isEditMode ? updateReviewMutation.isPending : createReviewMutation.isPending)
                        ? 'Saving...'
                        : submitButtonText}
                    </Button>
                  </div>
                </FormElement>
              )}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default CreateReview;