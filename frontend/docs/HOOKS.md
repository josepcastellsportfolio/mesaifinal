# Custom Hooks Documentation

This document provides comprehensive documentation for all custom hooks in the MesaIFinal Frontend.

## 📋 Table of Contents

- [Overview](#overview)
- [Hook Guidelines](#hook-guidelines)
- [State Management Hooks](#state-management-hooks)
- [Data Fetching Hooks](#data-fetching-hooks)
- [UI Interaction Hooks](#ui-interaction-hooks)
- [Utility Hooks](#utility-hooks)
- [Performance Hooks](#performance-hooks)
- [Form Hooks](#form-hooks)
- [Event Hooks](#event-hooks)

## 🔍 Overview

Custom hooks provide reusable logic across components, following React's composition patterns and best practices:

- **Single Responsibility**: Each hook has a clear, focused purpose
- **TypeScript**: Fully typed with proper interfaces
- **Error Handling**: Comprehensive error management
- **Performance**: Optimized with proper dependencies
- **Testing**: Fully testable with clear interfaces

## 📐 Hook Guidelines

### Hook Structure

```typescript
// Hook file structure
useHookName/
├── useHookName.ts          # Main hook
├── useHookName.test.ts     # Tests
├── index.ts                # Export
└── README.md               # Hook documentation
```

### Hook Template

```typescript
import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook description
 * @param param1 - Description of param1
 * @param param2 - Description of param2
 * @returns Description of return value
 */
interface UseHookNameOptions {
  param1: string;
  param2?: number;
  onSuccess?: (result: unknown) => void;
  onError?: (error: Error) => void;
}

interface UseHookNameReturn {
  data: unknown;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useHookName(options: UseHookNameOptions): UseHookNameReturn {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Hook logic here
      const result = await someAsyncOperation(options.param1);
      
      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [options.param1, options.onSuccess, options.onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
```

### Hook Testing

```typescript
// useHookName.test.ts
import { renderHook, act } from '@testing-library/react';
import { useHookName } from './useHookName';

describe('useHookName', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useHookName({ param1: 'test' }));
    
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle success case', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => 
      useHookName({ 
        param1: 'test', 
        onSuccess 
      })
    );

    await act(async () => {
      // Wait for async operation
    });

    expect(result.current.data).toBeDefined();
    expect(onSuccess).toHaveBeenCalled();
  });

  it('should handle error case', async () => {
    const onError = jest.fn();
    const { result } = renderHook(() => 
      useHookName({ 
        param1: 'invalid', 
        onError 
      })
    );

    await act(async () => {
      // Wait for async operation
    });

    expect(result.current.error).toBeDefined();
    expect(onError).toHaveBeenCalled();
  });
});
```

## 🏪 State Management Hooks

### useLocalStorage

A hook for managing state in localStorage with automatic serialization.

```typescript
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Basic usage
const [value, setValue] = useLocalStorage('key', 'default');

// With complex objects
const [user, setUser] = useLocalStorage('user', {
  id: null,
  name: '',
  preferences: {}
});

// Usage in component
function UserProfile() {
  const [user, setUser] = useLocalStorage('user', null);
  
  const updateUser = (newUser) => {
    setUser(newUser);
  };

  return (
    <div>
      {user ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

**Parameters:**
- `key`: string - localStorage key
- `initialValue`: T - Default value

**Returns:**
- `[value, setValue]`: [T, (value: T | ((val: T) => T)) => void]

### useSessionStorage

A hook for managing state in sessionStorage.

```typescript
import { useSessionStorage } from '@/hooks/useSessionStorage';

const [sessionData, setSessionData] = useSessionStorage('session', null);
```

**Parameters:**
- `key`: string - sessionStorage key
- `initialValue`: T - Default value

**Returns:**
- `[value, setValue]`: [T, (value: T | ((val: T) => T)) => void]

### usePrevious

A hook to track the previous value of a state or prop.

```typescript
import { usePrevious } from '@/hooks/usePrevious';

function Counter() {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {previousCount}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

**Parameters:**
- `value`: T - Current value to track

**Returns:**
- `previousValue`: T | undefined - Previous value

## 📡 Data Fetching Hooks

### useDebounce

A hook for debouncing values, useful for search inputs.

```typescript
import { useDebounce } from '@/hooks/useDebounce';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // This effect will only run when debouncedSearchTerm changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

**Parameters:**
- `value`: T - Value to debounce
- `delay`: number - Delay in milliseconds

**Returns:**
- `debouncedValue`: T - Debounced value

### useAsync

A hook for managing async operations with loading, error, and success states.

```typescript
import { useAsync } from '@/hooks/useAsync';

function DataFetcher() {
  const { data, loading, error, execute } = useAsync(fetchData);

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;

  return <div>{/* Render data */}</div>;
}
```

**Parameters:**
- `asyncFunction`: () => Promise<T> - Async function to execute
- `immediate`: boolean - Whether to execute immediately

**Returns:**
- `{ data, loading, error, execute }`: AsyncState<T>

### useFetch

A hook for making HTTP requests with automatic caching and error handling.

```typescript
import { useFetch } from '@/hooks/useFetch';

function ProductList() {
  const { data, loading, error, refetch } = useFetch('/api/products', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div>
      {data?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**Parameters:**
- `url`: string - Request URL
- `options`: RequestInit - Fetch options

**Returns:**
- `{ data, loading, error, refetch }`: FetchState<T>

## 🎨 UI Interaction Hooks

### useClickOutside

A hook for detecting clicks outside a component.

```typescript
import { useClickOutside } from '@/hooks/useClickOutside';

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    setIsOpen(false);
  });

  return (
    <div ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle Dropdown
      </button>
      {isOpen && (
        <div className="dropdown-content">
          <div>Option 1</div>
          <div>Option 2</div>
        </div>
      )}
    </div>
  );
}
```

**Parameters:**
- `ref`: RefObject<HTMLElement> - Reference to the element
- `handler`: () => void - Callback when click outside occurs

**Returns:**
- `void`

### useHover

A hook for detecting hover state.

```typescript
import { useHover } from '@/hooks/useHover';

function HoverableCard() {
  const [ref, isHovered] = useHover();

  return (
    <div 
      ref={ref}
      className={`card ${isHovered ? 'card--hovered' : ''}`}
    >
      <h3>Card Title</h3>
      {isHovered && <p>Additional content on hover</p>}
    </div>
  );
}
```

**Parameters:**
- None

**Returns:**
- `[ref, isHovered]`: [RefObject<HTMLElement>, boolean]

### useScroll

A hook for tracking scroll position and direction.

```typescript
import { useScroll } from '@/hooks/useScroll';

function ScrollTracker() {
  const { scrollY, scrollX, direction } = useScroll();

  return (
    <div>
      <p>Scroll Y: {scrollY}</p>
      <p>Scroll X: {scrollX}</p>
      <p>Direction: {direction}</p>
    </div>
  );
}
```

**Parameters:**
- None

**Returns:**
- `{ scrollY, scrollX, direction }`: ScrollState

### useMediaQuery

A hook for responsive design with media queries.

```typescript
import { useMediaQuery } from '@/hooks/useMediaQuery';

function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  return (
    <div>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}
```

**Parameters:**
- `query`: string - CSS media query

**Returns:**
- `matches`: boolean - Whether the media query matches

## 🛠️ Utility Hooks

### useInterval

A hook for setting up intervals with automatic cleanup.

```typescript
import { useInterval } from '@/hooks/useInterval';

function Timer() {
  const [count, setCount] = useState(0);

  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  return <div>Count: {count}</div>;
}
```

**Parameters:**
- `callback`: () => void - Function to call on interval
- `delay`: number | null - Delay in milliseconds (null to stop)

**Returns:**
- `void`

### useTimeout

A hook for setting up timeouts with automatic cleanup.

```typescript
import { useTimeout } from '@/hooks/useTimeout';

function DelayedMessage() {
  const [showMessage, setShowMessage] = useState(false);

  useTimeout(() => {
    setShowMessage(true);
  }, 2000);

  return showMessage ? <div>Delayed message!</div> : null;
}
```

**Parameters:**
- `callback`: () => void - Function to call after timeout
- `delay`: number | null - Delay in milliseconds (null to cancel)

**Returns:**
- `void`

### useToggle

A hook for boolean state management.

```typescript
import { useToggle } from '@/hooks/useToggle';

function ToggleComponent() {
  const [isOn, toggle] = useToggle(false);

  return (
    <div>
      <button onClick={toggle}>
        {isOn ? 'Turn Off' : 'Turn On'}
      </button>
      <p>Status: {isOn ? 'On' : 'Off'}</p>
    </div>
  );
}
```

**Parameters:**
- `initialValue`: boolean - Initial state

**Returns:**
- `[value, toggle]`: [boolean, () => void]

### useCounter

A hook for counter state management.

```typescript
import { useCounter } from '@/hooks/useCounter';

function Counter() {
  const { count, increment, decrement, reset, setCount } = useCounter(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
      <button onClick={() => setCount(10)}>Set to 10</button>
    </div>
  );
}
```

**Parameters:**
- `initialValue`: number - Initial count value
- `min`: number - Minimum value
- `max`: number - Maximum value

**Returns:**
- `{ count, increment, decrement, reset, setCount }`: CounterState

## ⚡ Performance Hooks

### useMemoizedCallback

A hook for memoizing callbacks with custom comparison.

```typescript
import { useMemoizedCallback } from '@/hooks/useMemoizedCallback';

function ExpensiveComponent({ items, onItemClick }) {
  const memoizedCallback = useMemoizedCallback(
    (item) => {
      onItemClick(item);
    },
    [onItemClick],
    (prevDeps, nextDeps) => {
      // Custom comparison logic
      return prevDeps[0] === nextDeps[0];
    }
  );

  return (
    <div>
      {items.map(item => (
        <Item 
          key={item.id} 
          item={item} 
          onClick={memoizedCallback}
        />
      ))}
    </div>
  );
}
```

**Parameters:**
- `callback`: (...args: any[]) => any - Function to memoize
- `dependencies`: any[] - Dependencies array
- `comparisonFn`: (prev: any[], next: any[]) => boolean - Custom comparison

**Returns:**
- `memoizedCallback`: (...args: any[]) => any

### useThrottle

A hook for throttling function calls.

```typescript
import { useThrottle } from '@/hooks/useThrottle';

function ScrollHandler() {
  const throttledScrollHandler = useThrottle((event) => {
    console.log('Scroll position:', event.target.scrollTop);
  }, 100);

  return (
    <div onScroll={throttledScrollHandler}>
      {/* Scrollable content */}
    </div>
  );
}
```

**Parameters:**
- `callback`: (...args: any[]) => void - Function to throttle
- `delay`: number - Throttle delay in milliseconds

**Returns:**
- `throttledCallback`: (...args: any[]) => void

### useLazyLoad

A hook for lazy loading images or components.

```typescript
import { useLazyLoad } from '@/hooks/useLazyLoad';

function LazyImage({ src, alt }) {
  const [ref, isVisible] = useLazyLoad();

  return (
    <div ref={ref}>
      {isVisible ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="placeholder">Loading...</div>
      )}
    </div>
  );
}
```

**Parameters:**
- `threshold`: number - Intersection observer threshold
- `rootMargin`: string - Intersection observer root margin

**Returns:**
- `[ref, isVisible]`: [RefObject<HTMLElement>, boolean]

## 📝 Form Hooks

### useFormState

A hook for managing form state with validation.

```typescript
import { useFormState } from '@/hooks/useFormState';

function ProductForm() {
  const {
    data,
    errors,
    touched,
    isValid,
    isDirty,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    validateForm
  } = useFormState(
    {
      name: '',
      price: 0,
      description: ''
    },
    {
      name: (value) => value.length < 3 ? 'Name must be at least 3 characters' : undefined,
      price: (value) => value <= 0 ? 'Price must be greater than 0' : undefined
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (await validateForm()) {
      // Submit form
      console.log('Form data:', data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={data.name}
        onChange={(e) => setFieldValue('name', e.target.value)}
        onBlur={() => setFieldTouched('name')}
      />
      {touched.name && errors.name && <span>{errors.name}</span>}
      
      <button type="submit" disabled={!isValid}>
        Submit
      </button>
    </form>
  );
}
```

**Parameters:**
- `initialData`: T - Initial form data
- `validationSchema`: ValidationSchema<T> - Validation rules

**Returns:**
- `FormState<T> & FormActions<T>`

### useField

A hook for managing individual form fields.

```typescript
import { useField } from '@/hooks/useField';

function FormField({ name, label, type = 'text' }) {
  const { value, error, touched, setValue, setTouched } = useField(name);

  return (
    <div>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched()}
      />
      {touched && error && <span className="error">{error}</span>}
    </div>
  );
}
```

**Parameters:**
- `name`: string - Field name
- `formContext`: FormContext - Form context (optional)

**Returns:**
- `{ value, error, touched, setValue, setTouched }`: FieldState

## 🎯 Event Hooks

### useEventListener

A hook for adding event listeners with automatic cleanup.

```typescript
import { useEventListener } from '@/hooks/useEventListener';

function KeyboardHandler() {
  const [key, setKey] = useState('');

  useEventListener('keydown', (event) => {
    setKey(event.key);
  });

  return <div>Last pressed key: {key}</div>;
}
```

**Parameters:**
- `eventName`: string - Event name
- `handler`: (event: Event) => void - Event handler
- `element`: HTMLElement | Window | Document - Target element

**Returns:**
- `void`

### useWindowSize

A hook for tracking window dimensions.

```typescript
import { useWindowSize } from '@/hooks/useWindowSize';

function ResponsiveLayout() {
  const { width, height } = useWindowSize();

  return (
    <div>
      <p>Window width: {width}px</p>
      <p>Window height: {height}px</p>
    </div>
  );
}
```

**Parameters:**
- None

**Returns:**
- `{ width, height }`: WindowSize

### useOnlineStatus

A hook for tracking online/offline status.

```typescript
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function NetworkStatus() {
  const isOnline = useOnlineStatus();

  return (
    <div className={`status ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? 'Online' : 'Offline'}
    </div>
  );
}
```

**Parameters:**
- None

**Returns:**
- `isOnline`: boolean

## 🔧 Advanced Hooks

### useReducerWithMiddleware

A hook for using reducer with middleware support.

```typescript
import { useReducerWithMiddleware } from '@/hooks/useReducerWithMiddleware';

const logger = (reducer) => (state, action) => {
  console.log('Previous state:', state);
  console.log('Action:', action);
  const newState = reducer(state, action);
  console.log('New state:', newState);
  return newState;
};

function CounterWithMiddleware() {
  const [state, dispatch] = useReducerWithMiddleware(
    counterReducer,
    { count: 0 },
    [logger]
  );

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>
        Increment
      </button>
    </div>
  );
}
```

**Parameters:**
- `reducer`: Reducer<S, A> - Reducer function
- `initialState`: S - Initial state
- `middleware`: Middleware<S, A>[] - Array of middleware functions

**Returns:**
- `[state, dispatch]`: [S, Dispatch<A>]

### useAsyncReducer

A hook for managing async state with reducer pattern.

```typescript
import { useAsyncReducer } from '@/hooks/useAsyncReducer';

const asyncReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function DataFetcher() {
  const [state, dispatch] = useAsyncReducer(asyncReducer, {
    data: null,
    loading: false,
    error: null
  });

  const fetchData = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await api.getData();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error });
    }
  };

  return (
    <div>
      {state.loading && <div>Loading...</div>}
      {state.error && <div>Error: {state.error.message}</div>}
      {state.data && <div>{/* Render data */}</div>}
      <button onClick={fetchData}>Fetch Data</button>
    </div>
  );
}
```

**Parameters:**
- `reducer`: Reducer<S, A> - Async reducer function
- `initialState`: S - Initial state

**Returns:**
- `[state, dispatch]`: [S, Dispatch<A>]

## 🧪 Testing Hooks

### Testing Custom Hooks

```typescript
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter(0));
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });

  it('should reset count', () => {
    const { result } = renderHook(() => useCounter(10));
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.count).toBe(0);
  });

  it('should respect min and max bounds', () => {
    const { result } = renderHook(() => useCounter(5, 0, 10));
    
    act(() => {
      result.current.setCount(15); // Should be capped at 10
    });
    
    expect(result.current.count).toBe(10);
    
    act(() => {
      result.current.setCount(-5); // Should be capped at 0
    });
    
    expect(result.current.count).toBe(0);
  });
});
```

## 📚 Best Practices

### Hook Composition

```typescript
// Compose multiple hooks
function useUserProfile(userId: string) {
  const { data: user, loading: userLoading } = useUser(userId);
  const { data: preferences, loading: prefLoading } = useUserPreferences(userId);
  const { data: activity, loading: activityLoading } = useUserActivity(userId);

  return {
    user,
    preferences,
    activity,
    loading: userLoading || prefLoading || activityLoading,
  };
}
```

### Error Boundaries with Hooks

```typescript
// Custom error boundary hook
function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: Error) => {
    setError(error);
    // Log error to monitoring service
    console.error('Error caught by hook:', error);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, resetError };
}
```

### Performance Optimization

```typescript
// Memoize expensive calculations
function useExpensiveCalculation(data: number[]) {
  const result = useMemo(() => {
    return data.reduce((acc, val) => acc + val * 2, 0);
  }, [data]);

  return result;
}

// Use callback for stable references
function useStableCallback(callback: Function) {
  return useCallback(callback, []);
}
```

---

For more detailed information about specific hooks, please refer to their individual documentation files in the hook directories.
