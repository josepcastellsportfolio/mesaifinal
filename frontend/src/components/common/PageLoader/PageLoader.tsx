import React from 'react';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './PageLoader.css';

interface PageLoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = 'Loading page...', 
  size = 'large' 
}) => {
  return (
    <div className="page-loader">
      <div className="page-loader-content">
        <LoadingSpinner size={size} />
        <p className="page-loader-message">{message}</p>
      </div>
    </div>
  );
};
