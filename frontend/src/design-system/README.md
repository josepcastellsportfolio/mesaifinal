# Design System

Un sistema de diseño híbrido profesional para aplicaciones React con Kendo UI.

## 📁 Estructura

```
design-system/
├── tokens/           # Design tokens (variables CSS)
│   ├── colors.css    # Paleta de colores
│   ├── typography.css # Sistema tipográfico
│   ├── spacing.css   # Espaciado consistente
│   ├── shadows.css   # Sombras y elevación
│   ├── borders.css   # Bordes y radius
│   └── index.css     # Importa todos los tokens
├── components/       # Estilos de componentes
│   ├── dashboard.css # Componentes del dashboard
│   ├── auth.css      # Componentes de autenticación
│   └── index.css     # Importa todos los componentes
├── layouts/          # Sistemas de layout
└── utilities/        # Clases utilitarias
```

## 🎨 Design Tokens

### Colores

Nuestro sistema usa una paleta de colores consistente con variantes del 50 al 900:

```css
/* Colores principales */
--color-primary-500: #3b82f6;
--color-secondary-500: #64748b;

/* Colores semánticos */
--color-success-500: #22c55e;
--color-warning-500: #f59e0b;
--color-danger-500: #ef4444;
--color-info-500: #06b6d4;

/* Colores de superficie */
--color-surface-primary: #ffffff;
--color-surface-secondary: #f8f9fa;
--color-text-primary: #1f2937;
--color-text-secondary: #6b7280;
```

### Tipografía

Sistema tipográfico escalable con tokens semánticos:

```css
/* Tamaños de fuente */
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */

/* Pesos de fuente */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Tokens semánticos */
--heading-h1-size: var(--font-size-4xl);
--body-base-size: var(--font-size-base);
```

### Espaciado

Sistema de espaciado basado en múltiplos de 4px:

```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-4: 1rem;      /* 16px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */

/* Tokens semánticos */
--spacing-button-padding-x: var(--spacing-4);
--spacing-card-padding: var(--spacing-6);
--spacing-section-padding: var(--spacing-8);
```

## 🧩 Componentes

### Botones

```css
.btn {
  /* Estilos base usando tokens */
  padding: var(--spacing-button-padding-y) var(--spacing-button-padding-x);
  border-radius: var(--border-radius-button);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-fast);
}

.btn-primary { /* Variante principal */ }
.btn-secondary { /* Variante secundaria */ }
.btn-outline { /* Variante outline */ }
```

### Cards

```css
.dashboard-card {
  background: var(--color-surface-primary);
  border: var(--border-card);
  border-radius: var(--border-radius-card);
  box-shadow: var(--shadow-card);
}
```

### Estados de carga

```css
.loading-spinner {
  border: 3px solid var(--color-border-primary);
  border-top-color: var(--color-primary-500);
  animation: spin 1s ease-in-out infinite;
}
```

## 🎯 Kendo UI Integration

Overrides personalizados para componentes Kendo:

```css
/* Botones Kendo */
.k-button-solid-primary {
  background-color: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

/* Cards Kendo */
.k-card {
  border: var(--border-card);
  border-radius: var(--border-radius-card);
  box-shadow: var(--shadow-card);
}

/* Formularios Kendo */
.k-textbox:focus {
  border-color: var(--border-color-focus);
  box-shadow: var(--shadow-input-focus);
}
```

## 🌙 Dark Theme

Soporte nativo para modo oscuro usando `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface-primary: #1a1a1a;
    --color-text-primary: #f9fafb;
    --color-bg-primary: #111827;
  }
}
```

## 📱 Responsive Design

Breakpoints consistentes:

```css
/* Tablet */
@media (max-width: 768px) {
  --spacing-container-padding: var(--spacing-3);
  --spacing-section-padding: var(--spacing-6);
}

/* Mobile */
@media (max-width: 480px) {
  --spacing-container-padding: var(--spacing-2);
  --spacing-section-padding: var(--spacing-4);
}
```

## 🚀 Uso

### 1. Importar en tu aplicación

```tsx
// En main.tsx o App.tsx
import './styles/app.css';
```

### 2. Usar tokens en componentes

```tsx
const MyComponent = () => (
  <div className="p-4 bg-primary rounded-lg shadow-md">
    <h2 className="heading-h2 text-primary mb-4">Título</h2>
    <p className="body-base text-secondary">Contenido</p>
  </div>
);
```

### 3. Crear componentes personalizados

```css
.my-component {
  padding: var(--spacing-card-padding);
  background: var(--color-surface-primary);
  border: var(--border-card);
  border-radius: var(--border-radius-card);
  box-shadow: var(--shadow-card);
  transition: var(--transition-fast);
}

.my-component:hover {
  box-shadow: var(--shadow-card-hover);
}
```

## ✨ Clases Utilitarias

### Espaciado
- `.p-4`, `.px-6`, `.py-2` - Padding
- `.m-4`, `.mx-auto`, `.my-6` - Margin
- `.gap-4` - Gap en flexbox/grid

### Colores
- `.text-primary`, `.text-secondary` - Colores de texto
- `.bg-primary`, `.bg-surface-secondary` - Colores de fondo

### Tipografía
- `.heading-h1`, `.heading-h2` - Headings semánticos
- `.body-base`, `.body-large` - Texto del cuerpo
- `.font-bold`, `.font-medium` - Pesos de fuente

### Layout
- `.flex`, `.flex-col` - Flexbox
- `.grid`, `.gap-4` - Grid
- `.w-full`, `.h-full` - Dimensiones

## 🔧 Personalización

Para personalizar el sistema, modifica los tokens en `tokens/`:

```css
:root {
  /* Personaliza colores principales */
  --color-primary-500: #your-brand-color;
  
  /* Personaliza tipografía */
  --font-family-sans: 'Your Font', sans-serif;
  
  /* Personaliza espaciado */
  --spacing-base: 1rem; /* Cambia la base del sistema */
}
```

## 🎨 Tokens Disponibles

- **Colores**: 60+ variables de color
- **Tipografía**: 15+ tamaños, 9 pesos
- **Espaciado**: 25+ valores de espaciado
- **Sombras**: 10+ niveles de elevación
- **Bordes**: 8+ valores de border-radius
- **Transiciones**: 4 velocidades
- **Z-index**: 8 niveles organizados

Este sistema garantiza consistencia visual, facilita el mantenimiento y permite escalabilidad en el diseño de la aplicación.
