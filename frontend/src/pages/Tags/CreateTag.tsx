import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Form, FormElement } from '@progress/kendo-react-form';
import { Input } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { Checkbox } from '@progress/kendo-react-inputs';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { useCreateTag, useUpdateTag, useTag } from '@/queries';
import type { TagCreate } from '@/queries/tags.queries';
import { ROUTES } from '@/constants';
import './CreateTag.css';

// Color palette for tags
const TAG_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#D7BDE2', '#A3E4D7',
  '#F9E79F', '#FADBD8', '#D5DBDB', '#AED6F1', '#E74C3C'
];

const CreateTag: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();

  const isEditMode = !!slug || !!searchParams.get('edit');
  const tagSlug = slug || null;

  // Queries and Mutations
  const { data: existingTag, isLoading: isLoadingTag } = useTag(tagSlug || '');
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();

  // State
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [formData, setFormData] = useState<Partial<TagCreate>>({
    name: '',
    color: TAG_COLORS[0],
    is_active: true,
  });

  // Update form data when editing and tag is loaded
  useEffect(() => {
    if (isEditMode && existingTag) {
      setSelectedColor(existingTag.color);
      setFormData({
        name: existingTag.name,
        color: existingTag.color,
        is_active: existingTag.is_active,
      });
    }
  }, [isEditMode, existingTag]);

  // Check for edit data from search params (optional fallback)
  useEffect(() => {
    if (!isEditMode && searchParams.get('edit')) {
      try {
        const parsed = JSON.parse(decodeURIComponent(searchParams.get('edit')!));
        setSelectedColor(parsed.color || TAG_COLORS[0]);
        setFormData({
          name: parsed.name || '',
          color: parsed.color || TAG_COLORS[0],
          is_active: parsed.is_active ?? true,
        });
      } catch (error) {
        console.error('Failed to parse edit data:', error);
      }
    }
  }, [isEditMode, searchParams]);

  // Event Handlers
  const handleSubmit = async (dataItem: Record<string, unknown>) => {
    const tagData: TagCreate = {
      name: dataItem.name as string,
      color: selectedColor,
      is_active: dataItem.is_active as boolean,
    };

    try {
      if (isEditMode) {
        if (tagSlug) {
          // Edit mode with slug (from URL like /tags/:slug/edit)
          const result = await updateTagMutation.mutateAsync({ slug: tagSlug, data: tagData });
          navigate(`/tags/${tagSlug}`);
        } else {
          // Fallback: try to get slug from search params
          const editData = searchParams.get('edit');
          if (editData) {
            try {
              const parsed = JSON.parse(decodeURIComponent(editData));
              if (parsed.slug) {
                const result = await updateTagMutation.mutateAsync({ slug: parsed.slug, data: tagData });
                navigate(`/tags/${parsed.slug}`);
              } else {
                throw new Error('No tag slug found in edit data');
              }
            } catch (error) {
              // Fallback to create mode if edit data is invalid
              const newTag = await createTagMutation.mutateAsync(tagData);
              navigate(`/tags/${newTag.slug}`);
            }
          } else {
            // Fallback to create mode if no edit data
            const newTag = await createTagMutation.mutateAsync(tagData);
            navigate(`/tags/${newTag.slug}`);
          }
        }
      } else {
        // Create mode
        const newTag = await createTagMutation.mutateAsync(tagData);
        navigate(`/tags/${newTag.slug}`);
      }
    } catch (error) {
      console.error(`❌ Failed to ${isEditMode ? 'update' : 'create'} tag:`, error);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.TAGS);
  };

  const handleColorSelect = (color: string, formRenderProps?: { onChange: (field: string, value: { value: string }) => void }) => {
    setSelectedColor(color);
    // Update the form field so it knows the color changed
    if (formRenderProps) {
      formRenderProps.onChange('color', { value: color });
    }
  };

  // Loading state
  if (isEditMode && isLoadingTag) {
    return (
      <div className="create-tag-page">
        <div className="loading-state">Loading tag data...</div>
      </div>
    );
  }

  const pageTitle = isEditMode ? 'Edit Tag' : 'Create New Tag';
  const submitButtonText = isEditMode ? 'Update Tag' : 'Create Tag';
  const loadingText = isEditMode ? 'Updating...' : 'Creating...';

  return (
    <div className="create-tag-page">
      <div className="page-header">
        <div className="header-content">
          <h1>{pageTitle}</h1>
          <p>{isEditMode ? 'Update tag information' : 'Create a new tag for organizing products'}</p>
        </div>
        <div className="header-actions">
          <Button
            onClick={handleCancel}
            fillMode="outline"
            size="large"
            className="cancel-button"
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="form-container">
        <Card className="form-card">
          <CardBody>
            <Form
                key={JSON.stringify(formData)} // fuerza el remount cuando formData cambia
                initialValues={formData}
                onSubmit={handleSubmit}
              render={(formRenderProps) => (
                <FormElement>
                  <div className="form-content">
                    <div className="form-section">
                      <h3>Basic Information</h3>
                      <div className="form-field">
                        <label htmlFor="name">Tag Name *</label>
                        <Input
                          name="name"
                          placeholder="Enter tag name (e.g., Electronics, Fashion, Sale)"
                          required={true}
                          className="form-input"
                          value={formRenderProps.valueGetter('name') || ''}
                          onChange={(e) => {
                            formRenderProps.onChange('name', { value: e.target.value });
                          }}
                        />
                      </div>

                      <div className="form-field">
                        <label>Tag Color *</label>
                        <div className="color-picker">
                          <div className="color-preview">
                            <div
                              className="selected-color"
                              style={{ backgroundColor: selectedColor }}
                            />
                            <span>Selected: {selectedColor}</span>
                          </div>
                          <div className="color-palette">
                            {TAG_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorSelect(color, formRenderProps)}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="form-field">
                        <Checkbox
                          name="is_active"
                          label="Active (tag can be used for products)"
                          className="checkbox-field"
                        />
                      </div>

                      {/* Hidden color field to track form changes */}
                      <input
                        type="hidden"
                        name="color"
                        value={selectedColor}
                      />
                    </div>

                    <div className="form-section preview-section">
                      <h3>Preview</h3>
                      <div className="tag-preview">
                        <div
                          className="preview-tag"
                          style={{
                            backgroundColor: selectedColor,
                            color: getContrastColor(selectedColor)
                          }}
                        >
                          {formRenderProps.valueGetter('name') || 'Tag Name'}
                        </div>
                        <p className="preview-description">
                          This is how your tag will appear on products
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <Button
                      type="button"
                      onClick={handleCancel}
                      fillMode="outline"
                      size="large"
                      className="cancel-button"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      themeColor="primary"
                      size="large"
                      disabled={
                        (isEditMode ? updateTagMutation.isPending : createTagMutation.isPending) ||
                        !formRenderProps.valueGetter('name')?.trim()
                      }
                    >
                      {(isEditMode ? updateTagMutation.isPending : createTagMutation.isPending)
                        ? loadingText
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

// Helper function to determine text color based on background
const getContrastColor = (hexColor: string): string => {
  const color = hexColor.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export default CreateTag;