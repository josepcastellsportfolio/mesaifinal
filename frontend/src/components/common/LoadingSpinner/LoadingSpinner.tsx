/**
 * Loading spinner component using Telerik UI components.
 * Provides consistent loading indicators throughout the application.
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlay?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  overlay = false,
  className = '',
}) => {
  const getLoaderSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'medium';
    }
  };

  const spinnerContent = (
    <div className={`loading-container ${className}`}>
      <div className={`loading-spinner ${getLoaderSize()}`}></div>
      {message && (
        <div className="loading-message">
          {message}
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-overlay flex items-center justify-center z-modal">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

// Specialized loading components for different use cases
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="loading-container">
    <LoadingSpinner size="large" message={message} />
  </div>
);

export const ButtonLoader: React.FC<{ message?: string }> = ({ message }) => (
  <LoadingSpinner size="small" message={message} />
);

export const OverlayLoader: React.FC<{ 
  message?: string; 
  visible: boolean;
}> = ({ message = 'Loading...', visible }) => {
  if (!visible) return null;
  
  return (
    <LoadingSpinner size="large" message={message} overlay />
  );
};

// HOC for adding loading state to components
export const withLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P & { isLoading?: boolean; loadingMessage?: string }) => {
    const { isLoading, loadingMessage, ...componentProps } = props;

    if (isLoading) {
      return <LoadingSpinner size="medium" message={loadingMessage} />;
    }

    return <Component {...(componentProps as P)} />;
  };
};

export default LoadingSpinner;

