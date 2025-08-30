# Component Documentation

This document provides comprehensive documentation for all reusable components in the MesaIFinal Frontend.

## 📋 Table of Contents

- [Overview](#overview)
- [Component Guidelines](#component-guidelines)
- [Common Components](#common-components)
- [Layout Components](#layout-components)
- [Form Components](#form-components)
- [Data Display Components](#data-display-components)
- [Navigation Components](#navigation-components)
- [Feedback Components](#feedback-components)
- [Utility Components](#utility-components)

## 🔍 Overview

The component library follows a consistent design system and architecture pattern:

- **TypeScript**: All components are fully typed
- **CSS Modules**: Scoped styling for each component
- **Accessibility**: WCAG 2.1 AA compliant
- **Responsive**: Mobile-first design approach
- **Themeable**: CSS variables for theming

## 📐 Component Guidelines

### Component Structure

```typescript
// Component file structure
ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.css          # Styles
├── ComponentName.test.tsx     # Tests
├── index.ts                   # Export
└── README.md                  # Component documentation
```

### Component Template

```typescript
import React from 'react';
import './ComponentName.css';

/**
 * ComponentName description
 * @param prop1 - Description of prop1
 * @param prop2 - Description of prop2
 */
interface ComponentNameProps {
  prop1: string;
  prop2?: number;
  className?: string;
  children?: React.ReactNode;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  prop1,
  prop2 = 0,
  className = '',
  children,
}) => {
  return (
    <div className={`component-name ${className}`}>
      {children}
    </div>
  );
};
```

### CSS Guidelines

```css
/* ComponentName.css */
.component-name {
  /* Base styles */
}

.component-name__element {
  /* BEM methodology */
}

.component-name--modifier {
  /* Modifier styles */
}

/* Responsive design */
@media (max-width: 768px) {
  .component-name {
    /* Mobile styles */
  }
}

/* Accessibility */
.component-name:focus {
  /* Focus styles */
}

/* Theme support */
.component-name {
  color: var(--color-text-primary);
  background: var(--color-background);
}
```

## 🧩 Common Components

### Button

A versatile button component with multiple variants and states.

```typescript
import { Button } from '@/components/common/Button/Button';

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Delete</Button>

// With sizes
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>

// With states
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>

// With icons
<Button icon="plus">Add Item</Button>
<Button icon="trash" iconPosition="right">Delete</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost'
- `size`: 'small' | 'medium' | 'large'
- `disabled`: boolean
- `loading`: boolean
- `icon`: string
- `iconPosition`: 'left' | 'right'
- `onClick`: function

### Input

A flexible input component with validation and error states.

```typescript
import { Input } from '@/components/common/Input/Input';

// Basic usage
<Input placeholder="Enter text..." />

// With label
<Input label="Email" type="email" />

// With validation
<Input 
  label="Password"
  type="password"
  error="Password is required"
  required
/>

// With prefix/suffix
<Input 
  prefix="$"
  suffix="USD"
  type="number"
  placeholder="0.00"
/>

// With helper text
<Input 
  label="Username"
  helperText="Must be at least 3 characters"
/>
```

**Props:**
- `label`: string
- `type`: HTML input types
- `error`: string
- `helperText`: string
- `prefix`: ReactNode
- `suffix`: ReactNode
- `required`: boolean
- `disabled`: boolean

### LoadingSpinner

A loading indicator component with different sizes and colors.

```typescript
import { LoadingSpinner } from '@/components/common/LoadingSpinner/LoadingSpinner';

// Basic usage
<LoadingSpinner />

// With sizes
<LoadingSpinner size="small" />
<LoadingSpinner size="medium" />
<LoadingSpinner size="large" />

// With colors
<LoadingSpinner color="primary" />
<LoadingSpinner color="secondary" />
<LoadingSpinner color="white" />

// With text
<LoadingSpinner text="Loading..." />
```

**Props:**
- `size`: 'small' | 'medium' | 'large'
- `color`: 'primary' | 'secondary' | 'white'
- `text`: string

### Modal

A modal dialog component with backdrop and animations.

```typescript
import { Modal } from '@/components/common/Modal/Modal';

// Basic usage
<Modal isOpen={isOpen} onClose={handleClose}>
  <h2>Modal Title</h2>
  <p>Modal content goes here...</p>
</Modal>

// With custom header/footer
<Modal 
  isOpen={isOpen} 
  onClose={handleClose}
  title="Custom Title"
  footer={
    <div>
      <Button onClick={handleSave}>Save</Button>
      <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    </div>
  }
>
  Modal content...
</Modal>

// With size variants
<Modal isOpen={isOpen} onClose={handleClose} size="large">
  Large modal content...
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `size`: 'small' | 'medium' | 'large'
- `footer`: ReactNode
- `closeOnBackdrop`: boolean

## 🏗️ Layout Components

### AppLayout

The main application layout with sidebar and header.

```typescript
import { AppLayout } from '@/components/common/Layout/AppLayout';

// Usage in App.tsx
<AppLayout>
  <Routes>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/products" element={<ProductsPage />} />
  </Routes>
</AppLayout>
```

**Features:**
- Responsive sidebar navigation
- Header with user menu
- Breadcrumb navigation
- Mobile-friendly design

### Sidebar

Navigation sidebar component with collapsible menu.

```typescript
import { Sidebar } from '@/components/common/Layout/Sidebar/Sidebar';

// Navigation items
const navItems = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    path: '/dashboard',
  },
  {
    label: 'Products',
    icon: 'package',
    path: '/products',
    children: [
      { label: 'All Products', path: '/products' },
      { label: 'Create Product', path: '/products/create' },
    ],
  },
];

<Sidebar 
  items={navItems}
  collapsed={sidebarCollapsed}
  onToggle={handleToggle}
/>
```

**Props:**
- `items`: NavigationItem[]
- `collapsed`: boolean
- `onToggle`: function
- `activePath`: string

### Header

Application header with user menu and notifications.

```typescript
import { Header } from '@/components/common/Layout/Header/Header';

<Header 
  user={currentUser}
  notifications={notifications}
  onLogout={handleLogout}
  onToggleSidebar={handleToggleSidebar}
/>
```

**Props:**
- `user`: User object
- `notifications`: Notification[]
- `onLogout`: function
- `onToggleSidebar`: function

## 📝 Form Components

### Form

A form wrapper component with validation and submission handling.

```typescript
import { Form } from '@/components/common/Form/Form';

<Form 
  initialValues={formData}
  validationSchema={validationSchema}
  onSubmit={handleSubmit}
>
  <FormField name="name" label="Name" />
  <FormField name="email" label="Email" type="email" />
  <Button type="submit">Submit</Button>
</Form>
```

**Props:**
- `initialValues`: object
- `validationSchema`: Yup schema
- `onSubmit`: function
- `children`: ReactNode

### FormField

A form field component with label, validation, and error display.

```typescript
import { FormField } from '@/components/common/Form/FormField/FormField';

<FormField 
  name="email"
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  required
/>
```

**Props:**
- `name`: string
- `label`: string
- `type`: string
- `placeholder`: string
- `required`: boolean
- `disabled`: boolean

### DropDownList

A dropdown component for selection from a list of options.

```typescript
import { DropDownList } from '@/components/common/DropDownList/DropDownList';

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

<DropDownList 
  data={options}
  textField="label"
  dataItemKey="value"
  value={selectedValue}
  onChange={handleChange}
  placeholder="Select an option"
/>
```

**Props:**
- `data`: array
- `textField`: string
- `dataItemKey`: string
- `value`: any
- `onChange`: function
- `placeholder`: string
- `disabled`: boolean

## 📊 Data Display Components

### DataTable

A comprehensive table component with sorting, filtering, and pagination.

```typescript
import { DataTable } from '@/components/common/DataTable/DataTable';

const columns = [
  { field: 'name', title: 'Name', sortable: true },
  { field: 'category', title: 'Category' },
  { field: 'price', title: 'Price', sortable: true },
  { field: 'status', title: 'Status' },
];

const data = [
  { id: '1', name: 'Product 1', category: 'Electronics', price: 100, status: 'Active' },
  { id: '2', name: 'Product 2', category: 'Clothing', price: 50, status: 'Inactive' },
];

<DataTable 
  data={data}
  columns={columns}
  sortable={true}
  filterable={true}
  selectable={{ mode: 'multiple' }}
  onSelectionChange={handleSelectionChange}
  onSort={handleSort}
  onFilter={handleFilter}
/>
```

**Props:**
- `data`: array
- `columns`: Column[]
- `sortable`: boolean
- `filterable`: boolean
- `selectable`: SelectableConfig
- `onSelectionChange`: function
- `onSort`: function
- `onFilter`: function

### Card

A card component for displaying content in a contained area.

```typescript
import { Card } from '@/components/common/Card/Card';

// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</Card>

// Card with header and footer
<Card 
  title="Card Title"
  subtitle="Card subtitle"
  footer={<Button>Action</Button>}
>
  Card content...
</Card>

// Card with actions
<Card 
  title="Product Card"
  actions={[
    { label: 'Edit', icon: 'edit', onClick: handleEdit },
    { label: 'Delete', icon: 'trash', onClick: handleDelete },
  ]}
>
  Product information...
</Card>
```

**Props:**
- `title`: string
- `subtitle`: string
- `actions`: Action[]
- `footer`: ReactNode
- `children`: ReactNode

### Badge

A badge component for displaying status, counts, or labels.

```typescript
import { Badge } from '@/components/common/Badge/Badge';

// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Error</Badge>

// Count badges
<Badge variant="primary">5</Badge>
<Badge variant="secondary">New</Badge>

// Custom color
<Badge color="#FF5733">Custom</Badge>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
- `color`: string
- `children`: ReactNode

## 🧭 Navigation Components

### Breadcrumb

A breadcrumb navigation component.

```typescript
import { Breadcrumb } from '@/components/common/Breadcrumb/Breadcrumb';

const items = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Electronics', path: '/products/electronics' },
];

<Breadcrumb items={items} />
```

**Props:**
- `items`: BreadcrumbItem[]
- `separator`: string

### Pagination

A pagination component for navigating through pages.

```typescript
import { Pagination } from '@/components/common/Pagination/Pagination';

<Pagination 
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  pageSize={pageSize}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
/>
```

**Props:**
- `currentPage`: number
- `totalPages`: number
- `totalItems`: number
- `pageSize`: number
- `onPageChange`: function
- `onPageSizeChange`: function

## 💬 Feedback Components

### Toast

A toast notification component for displaying messages.

```typescript
import { Toast } from '@/components/common/Toast/Toast';

// Success toast
<Toast 
  type="success"
  title="Success!"
  message="Operation completed successfully"
  duration={5000}
/>

// Error toast
<Toast 
  type="error"
  title="Error"
  message="Something went wrong"
  duration={0} // Persistent
/>

// With actions
<Toast 
  type="info"
  title="Update Available"
  message="A new version is available"
  actions={[
    { label: 'Update Now', onClick: handleUpdate },
    { label: 'Later', onClick: handleDismiss },
  ]}
/>
```

**Props:**
- `type`: 'success' | 'error' | 'warning' | 'info'
- `title`: string
- `message`: string
- `duration`: number
- `actions`: Action[]

### Alert

An alert component for displaying important messages.

```typescript
import { Alert } from '@/components/common/Alert/Alert';

// Info alert
<Alert type="info">
  This is an informational message.
</Alert>

// Warning alert
<Alert type="warning" title="Warning">
  This action cannot be undone.
</Alert>

// Error alert
<Alert type="error" title="Error" closable>
  Something went wrong. Please try again.
</Alert>

// Success alert
<Alert type="success" title="Success" closable>
  Your changes have been saved successfully.
</Alert>
```

**Props:**
- `type`: 'success' | 'error' | 'warning' | 'info'
- `title`: string
- `closable`: boolean
- `onClose`: function
- `children`: ReactNode

### ProgressBar

A progress bar component for displaying progress.

```typescript
import { ProgressBar } from '@/components/common/ProgressBar/ProgressBar';

// Basic progress bar
<ProgressBar value={75} />

// With label
<ProgressBar value={75} label="Upload Progress" />

// With color variants
<ProgressBar value={75} variant="success" />
<ProgressBar value={50} variant="warning" />
<ProgressBar value={25} variant="danger" />

// Animated
<ProgressBar value={75} animated />

// Indeterminate
<ProgressBar indeterminate />
```

**Props:**
- `value`: number (0-100)
- `label`: string
- `variant`: 'primary' | 'success' | 'warning' | 'danger'
- `animated`: boolean
- `indeterminate`: boolean

## 🛠️ Utility Components

### ErrorBoundary

A React error boundary component for catching and handling errors.

```typescript
import { ErrorBoundary } from '@/components/common/ErrorBoundary/ErrorBoundary';

<ErrorBoundary 
  fallback={<ErrorFallback />}
  onError={handleError}
>
  <ComponentThatMightError />
</ErrorBoundary>
```

**Props:**
- `fallback`: ReactNode | function
- `onError`: function
- `children`: ReactNode

### Portal

A portal component for rendering content outside the normal DOM hierarchy.

```typescript
import { Portal } from '@/components/common/Portal/Portal';

<Portal container={document.body}>
  <Modal isOpen={isOpen}>
    Modal content rendered in body
  </Modal>
</Portal>
```

**Props:**
- `container`: HTMLElement
- `children`: ReactNode

### LazyLoad

A lazy loading component for images and other content.

```typescript
import { LazyLoad } from '@/components/common/LazyLoad/LazyLoad';

<LazyLoad 
  placeholder={<Skeleton />}
  threshold={0.1}
>
  <img src="large-image.jpg" alt="Large image" />
</LazyLoad>
```

**Props:**
- `placeholder`: ReactNode
- `threshold`: number
- `children`: ReactNode

## 🎨 Theming

### CSS Variables

Components use CSS variables for consistent theming:

```css
:root {
  /* Colors */
  --color-primary: #0078d4;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-warning: #ffc107;
  --color-danger: #dc3545;
  
  /* Typography */
  --font-family-primary: 'Segoe UI', system-ui, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 3rem;
  
  /* Border radius */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### Dark Theme

Components support dark theme through CSS variables:

```css
[data-theme="dark"] {
  --color-background: #1a1a1a;
  --color-surface: #2d2d2d;
  --color-text-primary: #ffffff;
  --color-text-secondary: #b3b3b3;
  --color-border: #404040;
}
```

## 📱 Responsive Design

### Breakpoints

Components use consistent breakpoints:

```css
/* Mobile first approach */
.component {
  /* Base styles for mobile */
}

/* Tablet */
@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    /* Desktop styles */
  }
}

/* Large desktop */
@media (min-width: 1200px) {
  .component {
    /* Large desktop styles */
  }
}
```

### Responsive Utilities

Common responsive utilities:

```css
/* Hide on mobile */
.hidden-mobile {
  display: none;
}

@media (min-width: 768px) {
  .hidden-mobile {
    display: block;
  }
}

/* Show only on mobile */
.mobile-only {
  display: block;
}

@media (min-width: 768px) {
  .mobile-only {
    display: none;
  }
}
```

## ♿ Accessibility

### ARIA Support

Components include proper ARIA attributes:

```typescript
// Button with proper ARIA
<Button 
  aria-label="Delete item"
  aria-describedby="delete-description"
  onClick={handleDelete}
>
  Delete
</Button>

// Modal with ARIA
<Modal 
  isOpen={isOpen}
  onClose={handleClose}
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Modal Title</h2>
  <p id="modal-description">Modal description...</p>
</Modal>
```

### Keyboard Navigation

Components support keyboard navigation:

```typescript
// Dropdown with keyboard support
<DropDownList 
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleSelect();
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  }}
/>

// Modal with focus trap
<Modal 
  isOpen={isOpen}
  onClose={handleClose}
  trapFocus={true}
  returnFocus={true}
>
  Modal content...
</Modal>
```

## 🧪 Testing

### Component Testing

Components include comprehensive tests:

```typescript
// Button.test.tsx
describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Accessibility Testing

Components include accessibility tests:

```typescript
// Accessibility tests
describe('Button accessibility', () => {
  it('has correct ARIA attributes', () => {
    render(<Button aria-label="Delete">Delete</Button>);
    expect(screen.getByLabelText('Delete')).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText('Click me');
    
    button.focus();
    expect(button).toHaveFocus();
    
    fireEvent.keyDown(button, { key: 'Enter' });
    // Test keyboard interaction
  });
});
```

## 📚 Usage Examples

### Complete Form Example

```typescript
import { Form, FormField, Button, Alert } from '@/components/common';

const ProductForm = () => {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: ProductFormData) => {
    try {
      await createProduct(values);
      toast.success('Product created successfully!');
    } catch (err) {
      setError('Failed to create product');
    }
  };

  return (
    <Form 
      initialValues={initialValues}
      validationSchema={productSchema}
      onSubmit={handleSubmit}
    >
      {error && <Alert type="error">{error}</Alert>}
      
      <FormField 
        name="name"
        label="Product Name"
        placeholder="Enter product name"
        required
      />
      
      <FormField 
        name="description"
        label="Description"
        type="textarea"
        placeholder="Enter product description"
      />
      
      <FormField 
        name="price"
        label="Price"
        type="number"
        prefix="$"
        placeholder="0.00"
        required
      />
      
      <Button type="submit" loading={isSubmitting}>
        Create Product
      </Button>
    </Form>
  );
};
```

### Data Table with Actions

```typescript
import { DataTable, Button, Badge, Modal } from '@/components/common';

const ProductsTable = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const columns = [
    { field: 'name', title: 'Name', sortable: true },
    { field: 'category', title: 'Category' },
    { 
      field: 'price', 
      title: 'Price', 
      sortable: true,
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      field: 'status', 
      title: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'success' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      field: 'actions',
      title: 'Actions',
      render: (_, item: Product) => (
        <div className="table-actions">
          <Button size="small" onClick={() => handleEdit(item)}>
            Edit
          </Button>
          <Button 
            size="small" 
            variant="danger"
            onClick={() => handleDelete(item)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <DataTable 
        data={products}
        columns={columns}
        selectable={{ mode: 'multiple' }}
        onSelectionChange={setSelectedItems}
      />
      
      <Modal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <p>Are you sure you want to delete the selected items?</p>
        <div className="modal-actions">
          <Button 
            variant="danger"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
          <Button 
            variant="secondary"
            onClick={() => setDeleteModalOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
};
```

---

For more detailed information about specific components, please refer to their individual documentation files in the component directories.