import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Field, FormElement } from '@progress/kendo-react-form';
import { Input, Checkbox } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { useCreateCategory, useUpdateCategory, useCategory } from '@/queries';
import { ROUTES } from '@/constants';
import type { Category } from '@/types';

type CategoryCreateInput = {
  name: string;
  description?: string;
  is_active: boolean;
  parent?: number | null;
};

const CreateCategories: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditMode = !!slug;
  
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  
  // Load category data if in edit mode
  const { data: category, isLoading } = useCategory(slug || '', isEditMode);

  // Show loading state if editing and data is loading
  if (isEditMode && isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <h2>Loading category...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>{isEditMode ? 'Edit Category' : 'Create Category'}</h1>
          <p>{isEditMode ? 'Update category information' : 'Add a new category to organize products'}</p>
        </div>
      </div>

      <div className="page-content">
        <div className="k-card">
          <div className="k-card-body">
            <Form
              initialValues={isEditMode && category ? {
                name: category.name,
                description: category.description || '',
                is_active: category.is_active,
                parent: category.parent || null
              } : { name: '', description: '', is_active: true }}
              onSubmit={(values: Record<string, unknown>) => {
                const payload: CategoryCreateInput = {
                  name: String(values.name ?? ''),
                  description: (values.description as string) || undefined,
                  is_active: Boolean(values.is_active),
                  parent:
                    values.parent === null || values.parent === undefined
                      ? undefined
                      : Number(values.parent as number),
                };
                
                if (isEditMode && slug) {
                  updateMutation.mutate({ slug, data: payload as Partial<Category> }, {
                    onSuccess: () => navigate(ROUTES.CATEGORIES),
                  });
                } else {
                  createMutation.mutate(payload as Partial<Category>, {
                    onSuccess: () => navigate(ROUTES.CATEGORIES),
                  });
                }
              }}
              render={(formProps) => (
                <FormElement>
                  <Field name="name" component={Input} label="Name *" />
                  <Field name="description" component={Input} label="Description" />
                  <div className="featured-toggle" style={{ marginTop: 12 }}>
                    <Field name="is_active" component={Checkbox} label="Active" labelPlacement="after" />
                  </div>
                  <div className="form-actions">
                    <Button onClick={() => navigate(ROUTES.CATEGORIES)} className="cancel-button">Cancel</Button>
                    <Button 
                      type="submit" 
                      themeColor="primary" 
                      disabled={!formProps.allowSubmit || createMutation.isPending || updateMutation.isPending}
                    >
                      {isEditMode 
                        ? (updateMutation.isPending ? 'Updating...' : 'Update Category')
                        : (createMutation.isPending ? 'Creating...' : 'Create Category')
                      }
                    </Button>
                  </div>
                </FormElement>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCategories;


