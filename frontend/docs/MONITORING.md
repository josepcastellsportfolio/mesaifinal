# Sistema de Monitoreo y Analytics

Este documento describe el sistema de monitoreo, error tracking y analytics implementado en el frontend de MesaIFinal.

## 📊 Características

### Error Tracking
- Captura automática de errores de JavaScript
- Captura de errores de React con ErrorBoundary
- Captura de promesas rechazadas no manejadas
- Integración con servicios externos (Sentry, LogRocket, etc.)

### Performance Monitoring
- Core Web Vitals (LCP, FID, CLS)
- Métricas de rendimiento de componentes
- Tiempo de renderizado
- Tiempo de respuesta de interacciones

### Analytics
- Google Analytics 4
- Mixpanel
- Eventos personalizados
- Tracking de páginas
- Tracking de acciones de usuario

## 🚀 Configuración

### Variables de Entorno

```bash
# Error Tracking
VITE_ERROR_TRACKING_ENABLED=true
VITE_ERROR_TRACKING_ENDPOINT=https://api.mesaifinal.com/errors
VITE_ERROR_TRACKING_SAMPLE_RATE=1.0

# Analytics
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=google
VITE_ANALYTICS_TRACKING_ID=GA_MEASUREMENT_ID

# Performance
VITE_PERFORMANCE_ENABLED=true
VITE_PERFORMANCE_ENDPOINT=https://api.mesaifinal.com/performance
VITE_PERFORMANCE_SAMPLE_RATE=0.1
```

### Configuración por Defecto

```typescript
const defaultConfig: MonitoringConfig = {
  enabled: import.meta.env.PROD,
  errorTracking: {
    enabled: import.meta.env.PROD,
    sampleRate: 1.0, // 100% en producción
  },
  analytics: {
    enabled: import.meta.env.PROD,
    provider: 'google',
  },
  performance: {
    enabled: import.meta.env.PROD,
    sampleRate: 0.1, // 10% en producción
  },
};
```

## 📝 Uso

### ErrorBoundary Component

```tsx
import { ErrorBoundary } from '../components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      fallback={<CustomErrorComponent />}
      onError={(error, errorInfo) => {
        console.log('Error caught:', error);
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Hook de Error Boundary

```tsx
import { useErrorBoundary } from '../utils/monitoring';

function MyComponent() {
  const { handleError } = useErrorBoundary();

  const handleClick = () => {
    try {
      // Código que puede fallar
    } catch (error) {
      handleError(error, { componentStack: '' });
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Tracking de Performance

```tsx
import { usePerformanceTracking } from '../utils/monitoring';

function MyComponent() {
  const { trackRender, trackUserInteraction } = usePerformanceTracking('MyComponent');

  useEffect(() => {
    trackRender();
  });

  const handleClick = () => {
    trackUserInteraction('button_click', { buttonId: 'submit' });
    // Lógica del click
  };

  return <button onClick={handleClick}>Submit</button>;
}
```

### Analytics

```tsx
import { useAnalytics } from '../utils/monitoring';

function MyPage() {
  const { trackPageView, trackEvent } = useAnalytics();

  useEffect(() => {
    trackPageView('/products', 'Products Page');
  }, []);

  const handlePurchase = () => {
    trackEvent('purchase', 'ecommerce', 'product_purchase', 99.99);
  };

  return (
    <div>
      <h1>Products</h1>
      <button onClick={handlePurchase}>Buy Now</button>
    </div>
  );
}
```

## 🔧 API Reference

### MonitoringService

#### Métodos Principales

```typescript
// Configurar usuario
monitoring.setUserId('user123');

// Trackear error
monitoring.trackError({
  message: 'Error message',
  stack: 'Error stack trace',
  componentStack: 'React component stack',
});

// Trackear evento
monitoring.trackEvent({
  event: 'user_action',
  category: 'navigation',
  action: 'page_view',
  label: '/products',
  value: 1,
});

// Trackear métrica de performance
monitoring.trackPerformance({
  name: 'component_render',
  value: 150,
  unit: 'ms',
});

// Trackear vista de página
monitoring.trackPageView('/products', 'Products Page');

// Trackear acción de usuario
monitoring.trackUserAction('click', 'button', 'submit', 1);
```

### Hooks

#### useErrorBoundary()
Retorna funciones para manejar errores en componentes funcionales.

#### usePerformanceTracking(componentName: string)
Retorna funciones para trackear performance de componentes.

#### useAnalytics()
Retorna funciones para trackear eventos y vistas de página.

## 📈 Métricas de Performance

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: Tiempo hasta que se renderiza el contenido más grande
- **FID (First Input Delay)**: Tiempo desde la primera interacción hasta la respuesta
- **CLS (Cumulative Layout Shift)**: Estabilidad visual de la página

### Métricas Personalizadas

- **Component Render Time**: Tiempo de renderizado de componentes
- **User Interaction Response**: Tiempo de respuesta a interacciones
- **API Response Time**: Tiempo de respuesta de APIs

## 🛠️ Integración con Servicios Externos

### Google Analytics 4

```typescript
// Configuración automática
const config = {
  analytics: {
    provider: 'google',
    trackingId: 'GA_MEASUREMENT_ID',
  },
};

const monitoring = new MonitoringService(config);
```

### Mixpanel

```typescript
// Configuración automática
const config = {
  analytics: {
    provider: 'mixpanel',
    trackingId: 'MIXPANEL_TOKEN',
  },
};

const monitoring = new MonitoringService(config);
```

### Sentry (Error Tracking)

```typescript
// Integración manual
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: import.meta.env.MODE,
});

// En el ErrorBoundary
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  Sentry.captureException(error, { contexts: { react: errorInfo } });
  monitoring.trackError({
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
  });
}
```

## 📊 Dashboard y Reportes

### Métricas Disponibles

1. **Errores**
   - Tasa de error por página
   - Errores más frecuentes
   - Stack traces
   - Información del usuario

2. **Performance**
   - Core Web Vitals
   - Tiempo de carga de páginas
   - Tiempo de respuesta de APIs
   - Rendimiento de componentes

3. **Analytics**
   - Páginas más visitadas
   - Flujo de usuarios
   - Eventos personalizados
   - Conversiones

### Endpoints de API

```typescript
// Error tracking
POST /api/errors
{
  message: string;
  stack?: string;
  componentStack?: string;
  userId?: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

// Performance metrics
POST /api/performance
{
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  userId?: string;
}

// Analytics events
POST /api/analytics
{
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  timestamp: number;
  properties?: Record<string, unknown>;
}
```

## 🔒 Privacidad y Seguridad

### Datos Sensibles

- Los datos sensibles (tokens, contraseñas) se filtran automáticamente
- Los datos de usuario se anonimizan cuando es posible
- Cumplimiento con GDPR y otras regulaciones de privacidad

### Configuración de Privacidad

```typescript
const config = {
  errorTracking: {
    enabled: true,
    sampleRate: 0.1, // Solo 10% de errores
    filterSensitiveData: true,
  },
  analytics: {
    enabled: true,
    anonymizeUserData: true,
    respectDoNotTrack: true,
  },
};
```

## 🧪 Testing

### Testing de Error Tracking

```typescript
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

test('ErrorBoundary catches errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});
```

### Testing de Analytics

```typescript
import { useAnalytics } from '../utils/monitoring';

// Mock del servicio de analytics
jest.mock('../utils/monitoring', () => ({
  useAnalytics: () => ({
    trackEvent: jest.fn(),
    trackPageView: jest.fn(),
  }),
}));

test('tracks page view on mount', () => {
  const { trackPageView } = useAnalytics();
  
  render(<MyPage />);
  
  expect(trackPageView).toHaveBeenCalledWith('/products', 'Products Page');
});
```

## 📚 Recursos Adicionales

- [Core Web Vitals](https://web.dev/vitals/)
- [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Mixpanel Documentation](https://developer.mixpanel.com/)
- [Sentry React](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Performance Observer API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)
