# Contributing to Mesai Final

Thank you for your interest in contributing to Mesai Final! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the issue templates** provided
3. **Provide detailed information** including:
   - Steps to reproduce the issue
   - Expected vs actual behavior
   - Environment details (OS, browser, versions)
   - Screenshots or error logs if applicable

### Suggesting Features

When suggesting new features:

1. **Check the roadmap** to see if it's already planned
2. **Explain the use case** and why it would be valuable
3. **Consider the impact** on existing functionality
4. **Provide mockups or examples** if applicable

### Submitting Code Changes

#### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/josepcastellsportfolio/mesaifinal.git
cd mesaifinal

# Add the original repository as upstream
git remote add upstream https://github.com/josepcastellsportfolio/mesaifinal.git
```

#### 2. Set Up Development Environment

```bash
# Copy environment variables
cp env.example .env

# Start development environment
make dev-up

# Run migrations
make migrate

# Create superuser
make createsuperuser
```

#### 3. Create a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

#### 4. Make Your Changes

- Follow the coding standards outlined below
- Write or update tests as needed
- Update documentation if necessary
- Commit your changes with clear, descriptive messages

#### 5. Test Your Changes

```bash
# Run backend tests
make test-backend

# Run frontend tests
make test-frontend

# Run linting
make lint-backend
make lint-frontend

# Test the application manually
```

#### 6. Submit a Pull Request

1. **Push your branch** to your fork
2. **Create a pull request** from your branch to the main repository
3. **Fill out the PR template** completely
4. **Link related issues** using keywords (fixes #123)
5. **Request review** from maintainers

## 📋 Coding Standards

### Backend (Python/Django)

#### Code Style
- Follow **PEP 8** style guide
- Use **Black** for code formatting
- Use **isort** for import sorting
- Maximum line length: **88 characters**

```bash
# Format code
black .
isort .

# Check style
flake8 .
```

#### Django Best Practices
- Use **class-based views** and **ViewSets**
- Implement proper **serializers** with validation
- Use **custom permissions** for access control
- Write **comprehensive tests** for all functionality
- Use **signals** for decoupled business logic
- Optimize **database queries** with select_related/prefetch_related

#### Documentation
- Use **docstrings** for all functions and classes
- Follow **Google docstring format**
- Include **type hints** where appropriate

```python
def create_product(
    name: str, 
    category: Category, 
    price: Decimal
) -> Product:
    """
    Create a new product with the given parameters.
    
    Args:
        name: The product name
        category: The product category
        price: The product price
        
    Returns:
        The created product instance
        
    Raises:
        ValidationError: If the product data is invalid
    """
    return Product.objects.create(
        name=name,
        category=category,
        price=price
    )
```

### Frontend (React/TypeScript)

#### Code Style
- Use **TypeScript strict mode**
- Follow **ESLint** and **Prettier** configurations
- Use **functional components** with hooks
- Implement **proper error boundaries**

```bash
# Lint and format
npm run lint
npm run format
```

#### React Best Practices
- Use **custom hooks** for reusable logic
- Implement **proper state management**
- Use **Context API** for global state
- Write **comprehensive tests** with React Testing Library
- Optimize **performance** with React.memo and useMemo
- Follow **accessibility guidelines**

#### TypeScript Guidelines
- Define **interfaces** for all data structures
- Use **strict typing** throughout the application
- Avoid **any** type unless absolutely necessary
- Use **generic types** where appropriate

```typescript
interface Product {
  id: number;
  name: string;
  price: string;
  category: Category;
}

interface ApiResponse<T> {
  count: number;
  results: T[];
  next: string | null;
  previous: string | null;
}
```

#### Component Structure
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party imports
import { Grid, GridColumn } from '@progress/kendo-react-grid';

// 3. Internal imports
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/productService';

// 4. Type imports
import { Product } from '@/types';

// 5. Styles
import './ProductList.css';

interface ProductListProps {
  categoryId?: number;
  showFeatured?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({
  categoryId,
  showFeatured = false
}) => {
  // Component implementation
};

export default ProductList;
```

## 🧪 Testing Guidelines

### Backend Testing

#### Test Structure
- Use **pytest** for testing
- Organize tests in **test files** matching the module structure
- Use **factories** for test data creation
- Implement both **unit** and **integration** tests

```python
# tests/test_products.py
import pytest
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

class ProductModelTest(TestCase):
    """Test Product model functionality."""
    
    def setUp(self):
        self.product_data = {
            'name': 'Test Product',
            'price': Decimal('99.99'),
            'category': CategoryFactory(),
        }
    
    def test_create_product(self):
        """Test product creation."""
        product = Product.objects.create(**self.product_data)
        self.assertEqual(product.name, 'Test Product')
        self.assertTrue(product.is_active)

class ProductAPITest(APITestCase):
    """Test Product API endpoints."""
    
    def setUp(self):
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)
    
    def test_list_products(self):
        """Test product list endpoint."""
        response = self.client.get('/api/v1/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
```

#### Test Coverage
- Maintain **minimum 80%** test coverage
- Test **edge cases** and **error conditions**
- Include **integration tests** for API endpoints
- Test **permissions** and **authentication**

### Frontend Testing

#### Test Structure
- Use **React Testing Library** for component testing
- Use **Jest** for unit testing
- Test **user interactions** and **accessibility**
- Mock **API calls** appropriately

```typescript
// __tests__/ProductList.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductList from '@/components/ProductList';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ProductList', () => {
  test('renders product list', async () => {
    renderWithRouter(<ProductList />);
    
    await waitFor(() => {
      expect(screen.getByText('Products')).toBeInTheDocument();
    });
  });
  
  test('handles product selection', async () => {
    const mockOnSelect = jest.fn();
    renderWithRouter(<ProductList onSelect={mockOnSelect} />);
    
    const productItem = await screen.findByText('Test Product');
    fireEvent.click(productItem);
    
    expect(mockOnSelect).toHaveBeenCalledWith(expect.any(Object));
  });
});
```

## 📝 Commit Message Guidelines

### Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```
feat(auth): add JWT token refresh mechanism

Implement automatic token refresh when access token expires.
Includes retry logic for failed requests and proper error handling.

Closes #123
```

```
fix(products): resolve category filter not working

The category filter was not properly encoding URL parameters,
causing the API request to fail.

Fixes #456
```

## 🔄 Pull Request Process

### Before Submitting
1. **Rebase** your branch on the latest main
2. **Squash** related commits if necessary
3. **Test** your changes thoroughly
4. **Update** documentation if needed

### PR Requirements
- [ ] **Descriptive title** and description
- [ ] **Link to related issue(s)**
- [ ] **Tests** pass locally
- [ ] **Code** follows style guidelines
- [ ] **Documentation** updated if necessary
- [ ] **Breaking changes** documented

### Review Process
1. **Automated checks** must pass
2. **Code review** by at least one maintainer
3. **Manual testing** if necessary
4. **Approval** required before merge

## 🐛 Bug Reports

### Before Reporting
1. **Update** to the latest version
2. **Search** existing issues
3. **Try** to reproduce the issue

### Bug Report Template
```markdown
## Bug Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., Ubuntu 20.04]
- Browser: [e.g., Chrome 96]
- Node.js: [e.g., 18.0.0]
- Python: [e.g., 3.11]

## Additional Context
Add any other context about the problem here.
```

## 🚀 Feature Requests

### Feature Request Template
```markdown
## Feature Description
A clear description of the feature you'd like to see.

## Problem Statement
What problem would this feature solve?

## Proposed Solution
How would you like this feature to work?

## Alternatives Considered
What other solutions have you considered?

## Additional Context
Add any other context or screenshots about the feature request.
```

## 📚 Documentation

### Types of Documentation
- **Code comments** for complex logic
- **API documentation** using OpenAPI/Swagger
- **README files** for setup and usage
- **Architecture decisions** in ADR format

### Writing Guidelines
- Use **clear, concise language**
- Include **code examples**
- Keep documentation **up to date**
- Use **proper formatting** (Markdown)

## 🏷️ Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist
- [ ] Update version numbers
- [ ] Update CHANGELOG.md
- [ ] Create release notes
- [ ] Tag the release
- [ ] Deploy to staging
- [ ] Test thoroughly
- [ ] Deploy to production

## ❓ Getting Help

### Communication Channels
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For general questions and ideas
- **Email**: For security issues and private matters

### Development Setup Help
If you're having trouble setting up the development environment:

1. **Check the README** for detailed setup instructions
2. **Search existing issues** for similar problems
3. **Create an issue** with your specific problem and environment details

## 🙏 Recognition

Contributors will be recognized in:
- **CONTRIBUTORS.md** file
- **Release notes** for significant contributions
- **GitHub contributors** section

Thank you for contributing to Mesai Final! 🎉
