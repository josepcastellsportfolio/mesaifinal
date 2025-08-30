# Contributing to MesaIFinal Frontend

Thank you for your interest in contributing to MesaIFinal Frontend! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **🐛 Bug Reports**: Report bugs and issues
- **✨ Feature Requests**: Suggest new features
- **📝 Documentation**: Improve documentation
- **💻 Code Contributions**: Submit pull requests
- **🧪 Testing**: Write or improve tests
- **🎨 UI/UX**: Design improvements and accessibility
- **🔧 Tooling**: Development tool improvements

### Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
4. **Make** your changes
5. **Test** your changes
6. **Commit** following our conventions
7. **Push** to your fork
8. **Submit** a pull request

## 🛠️ Development Setup

### Prerequisites

- Node.js 20+
- npm 9+ or yarn 1.22+
- Git

### Local Development

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/mesaifinal.git
cd mesaifinal/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

### Environment Setup

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_KENDO_UI_LICENSE_KEY=your-license-key
VITE_ENABLE_DEBUG_MODE=true
```

## 📋 Development Guidelines

### Code Style

We use **ESLint** and **Prettier** for code formatting. Run these commands before committing:

```bash
# Format code
npm run format

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

### TypeScript Guidelines

- Use **strict TypeScript** configuration
- Prefer **interfaces** over types for object shapes
- Use **`unknown`** instead of `any`
- Export types from dedicated type files
- Use **generic types** when appropriate

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ Avoid
type User = {
  id: any;
  name: string;
  email: string;
}
```

### React Guidelines

- Use **functional components** with hooks
- Implement **proper error boundaries**
- Use **React.memo** for expensive components
- Follow **React Query patterns** for data fetching
- Use **custom hooks** for reusable logic

```typescript
// ✅ Good
const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { data, isLoading, error } = useUser(user.id);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <UserCard user={data} />;
};

// ❌ Avoid
class UserProfile extends React.Component {
  // Class components are discouraged
}
```

### Component Guidelines

- Use **CSS Modules** for styling
- Follow **BEM methodology** for class naming
- Implement **responsive design** by default
- Add **accessibility attributes** (ARIA labels, roles)
- Write **comprehensive JSDoc** documentation

```typescript
/**
 * UserCard component displays user information in a card format
 * @param user - User object containing profile information
 * @param onEdit - Callback function when edit button is clicked
 * @param className - Additional CSS classes
 */
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  className?: string;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, className }) => {
  return (
    <div className={`user-card ${className || ''}`} role="article">
      <h3 className="user-card__title">{user.name}</h3>
      <p className="user-card__email">{user.email}</p>
      {onEdit && (
        <button 
          className="user-card__edit-btn"
          onClick={() => onEdit(user)}
          aria-label={`Edit ${user.name}`}
        >
          Edit
        </button>
      )}
    </div>
  );
};
```

### Testing Guidelines

- Write **unit tests** for all components
- Use **React Testing Library** for component testing
- Test **user interactions** and behavior
- Aim for **70%+ test coverage**
- Use **meaningful test descriptions**

```typescript
// ✅ Good test
describe('UserCard', () => {
  it('should display user name and email', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
    render(<UserCard user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
    const onEdit = jest.fn();
    render(<UserCard user={user} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit john doe/i }));
    expect(onEdit).toHaveBeenCalledWith(user);
  });
});
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Examples

```bash
# Feature
feat: add user profile page

# Bug fix
fix: resolve navigation issue in mobile view

# Documentation
docs: update API documentation

# Style changes
style: format code with prettier

# Refactoring
refactor: extract user service logic

# Performance
perf: optimize image loading

# Testing
test: add unit tests for UserCard component

# Chore
chore: update dependencies
```

### Commit Scope

Use scopes to indicate which part of the codebase is affected:

```bash
feat(components): add new Button component
fix(pages): resolve routing issue in dashboard
docs(api): update authentication documentation
style(global): update color scheme
```

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure tests pass**: `npm test`
2. **Fix linting issues**: `npm run lint:fix`
3. **Type checking**: `npm run type-check`
4. **Update documentation** if needed
5. **Add tests** for new features
6. **Update changelog** if applicable

### Pull Request Template

Use the following template when creating a PR:

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Accessibility testing completed

## Checklist
- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Corresponding changes to documentation made
- [ ] No new warnings generated
- [ ] Tests added that prove fix is effective or feature works

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Additional Notes
Any additional information or context
```

### Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **Code review** by maintainers
3. **Testing** verification
4. **Documentation** review
5. **Approval** from at least one maintainer

## 🐛 Bug Reports

### Bug Report Template

```markdown
## Bug Description
Clear and concise description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g. Windows 10, macOS 12]
- Browser: [e.g. Chrome 120, Firefox 115]
- Node.js version: [e.g. 20.10.0]
- npm version: [e.g. 10.2.3]

## Additional Context
Any other context about the problem
```

## ✨ Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear and concise description of the feature

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How would you like this feature to work?

## Alternative Solutions
Any alternative solutions you've considered

## Additional Context
Any other context, mockups, or examples
```

## 🧪 Testing Guidelines

### Test Structure

```
src/
├── __tests__/          # Test utilities and setup
├── components/
│   └── __tests__/      # Component tests
├── hooks/
│   └── __tests__/      # Hook tests
└── services/
    └── __tests__/      # Service tests
```

### Testing Best Practices

- **Test behavior, not implementation**
- **Use meaningful test descriptions**
- **Test edge cases and error scenarios**
- **Mock external dependencies**
- **Keep tests fast and reliable**

### Testing Tools

- **Jest**: Testing framework
- **React Testing Library**: Component testing
- **MSW**: API mocking
- **@testing-library/user-event**: User interactions

## 📚 Documentation Guidelines

### Code Documentation

- **JSDoc** for all public APIs
- **README** files for complex components
- **Inline comments** for complex logic
- **Type definitions** for all interfaces

### Documentation Standards

- **Clear and concise** language
- **Code examples** where appropriate
- **Screenshots** for UI components
- **Step-by-step** instructions for complex processes

## 🎨 UI/UX Guidelines

### Design Principles

- **Consistency** across components
- **Accessibility** by default
- **Responsive design** for all screen sizes
- **Performance** optimization

### Accessibility Standards

- **WCAG 2.1 AA** compliance
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Color contrast** requirements

## 🔒 Security Guidelines

### Security Best Practices

- **Input validation** on all forms
- **XSS prevention** in user inputs
- **Secure API calls** with proper authentication
- **Environment variable** protection

### Security Checklist

- [ ] No sensitive data in code
- [ ] Input sanitization implemented
- [ ] Authentication properly handled
- [ ] HTTPS used in production
- [ ] Dependencies regularly updated

## 🚀 Performance Guidelines

### Performance Standards

- **Bundle size** optimization
- **Lazy loading** for routes and components
- **Image optimization** and compression
- **Caching strategies** implementation

### Performance Checklist

- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] Bundle size acceptable
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals met

## 🤝 Community Guidelines

### Code of Conduct

- **Be respectful** and inclusive
- **Help others** learn and grow
- **Provide constructive** feedback
- **Follow project** guidelines

### Communication

- **GitHub Issues** for bug reports and feature requests
- **GitHub Discussions** for questions and ideas
- **Pull Request** comments for code review
- **Team chat** for real-time collaboration

## 📋 Review Checklist

Before submitting your contribution, ensure:

### Code Quality
- [ ] Code follows style guidelines
- [ ] TypeScript types are properly defined
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Performance considerations addressed

### Testing
- [ ] Unit tests written and passing
- [ ] Integration tests updated if needed
- [ ] Test coverage maintained or improved
- [ ] Edge cases tested

### Documentation
- [ ] Code is properly documented
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Changelog updated

### Accessibility
- [ ] ARIA labels implemented
- [ ] Keyboard navigation works
- [ ] Color contrast meets standards
- [ ] Screen reader compatibility tested

## 🏆 Recognition

Contributors will be recognized in:

- **Contributors list** in README
- **Release notes** for significant contributions
- **Project documentation** for major features
- **Team acknowledgments** for ongoing support

## 📞 Getting Help

If you need help with your contribution:

- **Documentation**: Check project documentation
- **Issues**: Search existing issues
- **Discussions**: Ask in GitHub Discussions
- **Team**: Reach out to maintainers

## 📄 License

By contributing to MesaIFinal Frontend, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MesaIFinal Frontend! 🎉
