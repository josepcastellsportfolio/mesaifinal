import React from 'react';
import { Card, CardBody } from '@progress/kendo-react-layout';
import './StatsCard.css';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
  onClick?: () => void;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
  onClick,
  className = "",
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = (isPositive: boolean) => {
    return isPositive ? '📈' : '📉';
  };

  return (
    <Card 
      className={`stats-card stats-card-${color} ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClick}
    >
      <CardBody>
        <div className="stats-card-content">
          <div className="stats-header">
            <div className="stats-title-section">
              <h3 className="stats-title">{title}</h3>
              {subtitle && <p className="stats-subtitle">{subtitle}</p>}
            </div>
            {icon && (
              <div className="stats-icon">
                <span className={`icon-${icon}`}>{icon}</span>
              </div>
            )}
          </div>
          
          <div className="stats-value-section">
            <div className="stats-value">{formatValue(value)}</div>
            {trend && (
              <div className={`stats-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                <span className="trend-icon">{getTrendIcon(trend.isPositive)}</span>
                <span className="trend-value">{Math.abs(trend.value)}%</span>
                <span className="trend-label">{trend.label}</span>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default StatsCard;
