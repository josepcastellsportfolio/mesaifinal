import React, { useCallback, useMemo } from 'react';
import { Badge } from '@progress/kendo-react-indicators';
import type { Tag } from '@/types';
import './TagBadge.css';

/**
 * Props interface for the TagBadge component
 */
export interface TagBadgeProps {
  /** Tag object containing name, color, and other properties */
  tag: Tag;
  /** Optional click handler for tag interaction */
  onClick?: (tag: Tag) => void;
  /** Optional remove handler for tag deletion */
  onRemove?: (tag: Tag) => void;
  /** Whether the tag can be removed */
  removable?: boolean;
  /** Size variant of the badge */
  size?: 'small' | 'medium' | 'large';
  /** Additional CSS classes */
  className?: string;
  /** Whether the tag is disabled */
  disabled?: boolean;
}

/**
 * TagBadge Component
 * 
 * A reusable tag display component with customizable colors, sizes, and interactions.
 * Automatically calculates contrast colors for optimal text readability.
 * 
 * Features:
 * - Automatic contrast color calculation
 * - Click and remove interactions
 * - Multiple size variants
 * - Accessibility support
 * - Custom styling support
 * 
 * @param props - TagBadge configuration options
 * @returns JSX.Element - Rendered tag badge component
 */
const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  onClick,
  onRemove,
  removable = false,
  size = 'small',
  className = "",
  disabled = false,
}) => {
  /**
   * Handles tag click events
   * Prevents event propagation to avoid conflicts with parent elements
   */
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.stopPropagation();
    if (onClick) {
      onClick(tag);
    }
  }, [onClick, tag, disabled]);

  /**
   * Handles tag removal
   * Prevents event propagation and calls remove handler
   */
  const handleRemove = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.stopPropagation();
    e.preventDefault();
    if (onRemove) {
      onRemove(tag);
    }
  }, [onRemove, tag, disabled]);

  /**
   * Calculates optimal contrast color for text readability
   * Uses W3C recommended luminance calculation
   * 
   * @param hexColor - Hex color string (with or without #)
   * @returns String - Either '#000000' or '#ffffff'
   */
  const getContrastColor = useCallback((hexColor: string): string => {
    // Remove # if present and ensure valid hex
    const color = hexColor.replace('#', '');
    
    // Handle short hex format (e.g., #fff -> #ffffff)
    const fullHex = color.length === 3 
      ? color.split('').map(char => char + char).join('')
      : color;
    
    // Convert to RGB
    const r = parseInt(fullHex.substr(0, 2), 16);
    const g = parseInt(fullHex.substr(2, 2), 16);
    const b = parseInt(fullHex.substr(4, 2), 16);
    
    // Calculate relative luminance using W3C formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return high contrast color
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }, []);

  /**
   * Memoized badge styling to prevent unnecessary recalculations
   */
  const badgeStyle = useMemo(() => ({
    backgroundColor: tag.color,
    color: getContrastColor(tag.color),
    border: `1px solid ${tag.color}`,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
  }), [tag.color, getContrastColor, disabled, onClick]);

  /**
   * Memoized CSS classes
   */
  const badgeClasses = useMemo(() => {
    const classes = ['custom-tag-badge'];
    if (onClick && !disabled) classes.push('clickable');
    if (disabled) classes.push('disabled');
    return classes.join(' ');
  }, [onClick, disabled]);

  /**
   * Memoized container classes
   */
  const containerClasses = useMemo(() => 
    `tag-badge ${className}`.trim(), 
    [className]
  );

  return (
    <div 
      className={containerClasses}
      onClick={handleClick}
      role="button"
      tabIndex={onClick && !disabled ? 0 : -1}
      aria-label={`Tag: ${tag.name}${removable ? ', removable' : ''}`}
      title={tag.name}
    >
      <Badge
        size={size}
        className={badgeClasses}
        style={badgeStyle}
      >
        <span className="tag-name">{tag.name}</span>
        {removable && (
          <button
            type="button"
            className="remove-button"
            onClick={handleRemove}
            disabled={disabled}
            aria-label={`Remove tag: ${tag.name}`}
            title={`Remove ${tag.name}`}
          >
            ×
          </button>
        )}
      </Badge>
    </div>
  );
};

export default TagBadge;
