import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Form, 
  Field, 
  FormElement
} from '@progress/kendo-react-form';
import type { FieldRenderProps } from '@progress/kendo-react-form';
import { 
  Input, 
  NumericTextBox,
  Checkbox
} from '@progress/kendo-react-inputs';
import { 
  DropDownList,
  MultiSelect
} from '@progress/kendo-react-dropdowns';
import { 
  Button 
} from '@progress/kendo-react-buttons';
import { 
  Card, 
  CardBody 
} from '@progress/kendo-react-layout';
import { useCreateProduct, useUpdateProduct, useCategories, useProduct, useTags } from '@/queries';
import { ROUTES, PRODUCT_STATUS } from '@/constants';
import type { ProductCreate, ApiError, ProductFormData, Category, Tag } from '@/types';
import './CreateProductPage.css';

const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditMode = !!slug;
  
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const { data: categoriesData } = useCategories();
  const { data: tagsData } = useTags();
  const tagsList = tagsData?.results || [];
  const categories = categoriesData?.results || [];
  
  const { data: product, isLoading } = useProduct(slug || '', isEditMode);

  // Estados para los dropdowns
  const [selectedStatus, setSelectedStatus] = useState<string>(PRODUCT_STATUS.DRAFT);
  const [selectedCategory, setSelectedCategory] = useState<{ id: number | null; name: string } | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  

  // Sincroniza los estados con los datos del producto en edición
  useEffect(() => {
    if (isEditMode && product) {
      setSelectedStatus(product.status || PRODUCT_STATUS.DRAFT);
      setSelectedCategory(product.category || null);
      setSelectedTags(product.tags || []);
    } else {
      setSelectedCategory(null);
      setSelectedTags([]);
    }
  }, [isEditMode, product]);

  // Default form data for create mode
  const defaultFormData: Partial<ProductCreate> = {
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    sku: '',
    status: PRODUCT_STATUS.DRAFT,
    is_featured: false,
    category_id: null,
    tag_ids: [],
  };

  // Form data for edit mode - memoized to prevent unnecessary re-renders
  const editFormData: Partial<ProductCreate> = React.useMemo(() => {
    if (!product) return defaultFormData;
    return {
      name: product.name || '',
      description: product.description || '',
      price: Number(product.price) || 0,
      stock_quantity: product.stock_quantity || 0,
      sku: product.sku || '',
      status: product.status || PRODUCT_STATUS.DRAFT,
      is_featured: product.is_featured || false,
      category_id: product.category?.id || null,
      tag_ids: product.tags ? product.tags.map((t) => t.id) : [],
    };
  }, [product]);

  const initialFormData = React.useMemo(
    () => (isEditMode ? editFormData : defaultFormData),
    [isEditMode, editFormData, defaultFormData]
  );

  if (isEditMode && isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <h2>Loading product...</h2>
        </div>
      </div>
    );
  }

  const statusOptions = [
    { text: 'Draft', value: PRODUCT_STATUS.DRAFT },
    { text: 'Published', value: PRODUCT_STATUS.PUBLISHED },
    { text: 'Archived', value: PRODUCT_STATUS.ARCHIVED },
  ];

  const handleSubmit = async (dataItem: Record<string, unknown>) => {
    let category_id = dataItem.category_id;
    if (category_id === null || category_id === undefined) {
      category_id = selectedCategory?.id || 0;
    }
    // Usa los tags seleccionados del estado
    const tag_ids = selectedTags.map(tag => tag.id);

    const productData: ProductFormData = {
      name: dataItem.name as string,
      description: (dataItem.description as string) || '',
      price: String(dataItem.price ?? ''),
      stock_quantity: dataItem.stock_quantity as number ?? 0,
      sku: dataItem.sku as string,
      status: dataItem.status as 'draft' | 'published' | 'archived',
      is_featured: dataItem.is_featured as boolean,
      category_id: typeof category_id === 'number' ? category_id : 0,
      tag_ids,
    };
    console.log('Product data to submit:', productData);
    if (isEditMode && slug) {
      updateProductMutation.mutate(
        { slug, data: productData },
        {
          onSuccess: (updatedProduct) => {
            navigate(ROUTES.PRODUCT_DETAIL.replace(':slug', updatedProduct.slug));
          },
          onError: (error: ApiError) => {
            console.error('Failed to update product:', error);
            console.error('Product data sent:', productData);
            if (error?.errors) {
              console.error('Validation errors:', error.errors);
            }
          }
        }
      );
    } else {
      createProductMutation.mutate(productData, {
        onSuccess: (createdProduct) => {
          navigate(ROUTES.PRODUCT_DETAIL.replace(':slug', createdProduct.slug));
        },
        onError: (error: ApiError) => {
          console.error('Failed to create product:', error);
          console.error('Product data sent:', productData);
          if (error?.errors) {
            console.error('Validation errors:', error.errors);
          }
        }
      });
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.PRODUCTS);
  };

  // Validation functions
  const requiredValidator = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) {
      return 'This field is required';
    }
    if (typeof value === 'string' && value.trim() === '') {
      return 'This field is required';
    }
    if (typeof value === 'number' && value <= 0) {
      return 'This field is required';
    }
    return '';
  };

  const priceValidator = (value: number) => {
    if (value < 0) {
      return 'Price must be greater than or equal to 0';
    }
    return '';
  };

  const stockValidator = (value: number) => {
    if (value < 0) {
      return 'Stock quantity must be greater than or equal to 0';
    }
    return '';
  };

  const pageTitle = isEditMode ? 'Edit Product' : 'Create New Product';
  const pageDescription = isEditMode ? 'Update product information' : 'Add a new product to your catalog';
  const submitButtonText = isEditMode ? 'Update Product' : 'Create Product';
  const loadingText = isEditMode ? 'Updating...' : 'Creating...';

  return (
    <div className="create-product-page">
      <div className="page-header">
        <div className="header-content">
          <h1>{pageTitle}</h1>
          <p>{pageDescription}</p>
        </div>
      </div>

      <div className="page-content">
        <Card className="product-form-card">
          <CardBody>
            <Form
              initialValues={initialFormData}
              onSubmit={handleSubmit}
              render={(formRenderProps: { allowSubmit: boolean }) => (
                <FormElement>
                  <div className="form-grid">
                    {/* Basic Information */}
                    <div className="form-section">
                      <h3>Basic Information</h3>
                      <Field
                        name="name"
                        component={Input}
                        label="Product Name *"
                        validator={requiredValidator}
                        placeholder="Enter product name"
                      />
                      <Field
                        name="description"
                        component={Input}
                        label="Description"
                        placeholder="Enter product description"
                      />
                      <Field
                        name="sku"
                        component={Input}
                        label="SKU *"
                        validator={requiredValidator}
                        placeholder="e.g., PROD-001"
                      />

                      <div className="input-with-icon">
                        <div className="field-header">
                          <span className="input-icon">📂</span>
                          <span className="field-title">Category</span>
                        </div>
                        <Field
                          name="category_id"
                          component={(fieldProps: FieldRenderProps) => {
                            const categoriesWithNone: Array<{ id: number | null; name: string }> = [
                              { id: null, name: 'None (No Category)' },
                              ...categories.map((cat: Category) => ({
                                id: cat.id,
                                name: cat.name
                              }))
                            ];
                            let currentValue = selectedCategory;
                            if (!currentValue) {
                              if (fieldProps.value === null) {
                                currentValue = { id: null, name: 'None (No Category)' };
                              } else if (fieldProps.value !== undefined) {
                                currentValue = categories.find((cat: Category) => cat.id === fieldProps.value) || null;
                              }
                            }
                            return (
                              <DropDownList
                                data={categoriesWithNone}
                                textField="name"
                                dataItemKey="id"
                                value={currentValue}
                                onChange={(e: { value: { id: number | null; name: string } | null }) => {
                                  const category = e.value;
                                  setSelectedCategory(category);
                                  const categoryId = category?.id;
                                  fieldProps.onChange({ value: categoryId });
                                }}
                                fillMode="solid"
                                rounded="medium"
                                size="medium"
                                className="category-dropdown"
                              />
                            );
                          }}
                        />
                        <div className="field-hint">Select a category or choose "None" for uncategorized products</div>
                      </div>

                      <div className="input-with-icon">
                        <div className="field-header">
                          <span className="input-icon">🏷️</span>
                          <span className="field-title">Tags</span>
                        </div>
                        <Field
                          name="tag_ids"
                          component={(fieldProps) => (
                          <MultiSelect
                            data={tagsList}
                            textField="name"
                            dataItemKey="id"
                            value={selectedTags}
                            onChange={e => {
                                if (e && Array.isArray(e.value) && e.value.length === 0) {
                                  // Se han quitado todos los tags
                                  setSelectedTags([]);
                                  fieldProps.onChange({
                                    value: [],
                                    field: 'tag_ids'
                                  });
                                  return;
                                }
                                if (e && Array.isArray(e.value)) {
                                  setSelectedTags(e.value);
                                  if (fieldProps && typeof fieldProps.onChange === 'function') {
                                    fieldProps.onChange(e.value.map((tag: Tag) => tag.id));
                                  }
                                }
                              }}
                            placeholder="Select tags"
                            style={{ minWidth: 220 }}
                            popupSettings={{ height: 300 }}
                          />
                                                    )}
                        />
                        <div className="field-hint">Select one or more tags for this product</div>
                      </div>
                    </div>
                    {/* Pricing & Inventory */}
                    <div className="form-section">
                      <h3>Pricing & Inventory</h3>
                      <div className="pricing-inventory-grid">
                        <div className="pricing-group">
                          <div className="input-with-icon">
                            <div className="field-header">
                              <span className="input-icon">💰</span>
                              <span className="field-title">Price *</span>
                            </div>
                            <Field
                              name="price"
                              component={NumericTextBox}
                              validator={priceValidator}
                              format="c2"
                              min={0}
                              step={0.01}
                              placeholder="0.00"
                            />
                            <div className="field-hint">Set the selling price</div>
                          </div>
                        </div>
                        <div className="inventory-group">
                          <div className="input-with-icon">
                            <div className="field-header">
                              <span className="input-icon">📦</span>
                              <span className="field-title">Stock Quantity *</span>
                            </div>
                            <Field
                              name="stock_quantity"
                              component={NumericTextBox}
                              validator={stockValidator}
                              format="n0"
                              min={0}
                              step={1}
                              placeholder="0"
                            />
                            <div className="field-hint">Available stock quantity</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Status & Settings */}
                    <div className="form-section">
                      <h3>Status & Settings</h3>
                      <div className="input-with-icon">
                        <div className="field-header">
                          <span className="input-icon">📊</span>
                          <span className="field-title">Status</span>
                        </div>
                        <Field
                          name="status"
                          component={(fieldProps: FieldRenderProps) => {
                            const selectedItem = statusOptions.find((o) => o.value === selectedStatus) || statusOptions[0];
                            return (
                              <DropDownList
                                data={statusOptions}
                                textField="text"
                                dataItemKey="value"
                                value={selectedItem}
                                onChange={(e: { value: { value: 'draft' | 'published' | 'archived' } }) => {
                                  const newValue = e.value?.value;
                                  setSelectedStatus(newValue);
                                  fieldProps.onChange({ value: newValue });
                                }}
                                fillMode="solid"
                                rounded="medium"
                                size="medium"
                                itemRender={(li, itemProps) =>
                                  React.cloneElement(
                                    li,
                                    li.props,
                                    <span className="ddl-item">{itemProps.dataItem.text}</span>
                                  )
                                }
                                valueRender={(_, value) => (
                                  <span className="ddl-value">{value ? value.text : 'Select status'}</span>
                                )}
                              />
                            );
                          }}
                        />
                        <div className="field-hint">Set the product publication status</div>
                      </div>
                      <div className="input-with-icon">
                        <div className="field-header">
                          <span className="input-icon">⭐</span>
                          <span className="field-title">Featured Product</span>
                        </div>
                        <Field
                          name="is_featured"
                          component={Checkbox}
                          labelPlacement="after"
                        />
                        <div className="field-hint">Mark this product as featured to highlight it</div>
                      </div>
                    </div>
                  </div>
                  {/* Error Message */}
                  {createProductMutation.isError && (
                    <div className="alert alert-danger">
                      <div className="alert-content">
                        <div className="alert-message">
                          {createProductMutation.error?.message || 'Failed to create product. Please try again.'}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Form Actions */}
                  <div className="form-actions">
                    <Button
                      type="button"
                      onClick={handleCancel}
                      disabled={createProductMutation.isPending}
                      className="cancel-button"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      themeColor="primary"
                      disabled={
                        (isEditMode ? updateProductMutation.isPending : createProductMutation.isPending) ||
                        !formRenderProps.allowSubmit ||
                        selectedCategory?.name === 'None (No category)' ||
                        (selectedTags.length === 0 && formRenderProps.value?.tag_ids?.length === 0)
                      }
                    >
                      {(isEditMode ? updateProductMutation.isPending : createProductMutation.isPending)
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

export default CreateProductPage;