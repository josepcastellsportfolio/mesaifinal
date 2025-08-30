import React, { useCallback, useMemo } from 'react';
import { Input, type InputChangeEvent } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import './SearchBar.css';

/**
 * Props interface for the SearchBar component
 * Defines all the configurable options for the search functionality
 */
export interface SearchBarProps {
  /** Current search value */
  value: string;
  /** Callback fired when search value changes */
  onChange: (value: string) => void;
  /** Optional callback fired when search is triggered */
  onSearch?: () => void;
  /** Placeholder text for the input field */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the search button */
  showSearchButton?: boolean;
  /** Whether the search bar is disabled */
  disabled?: boolean;
  /** Whether to trigger search on every keystroke (debounced) */
  instantSearch?: boolean;
}

/**
 * SearchBar Component
 * 
 * A reusable search input component with optional search button.
 * Supports keyboard navigation (Enter key) and customizable styling.
 * 
 * Features:
 * - Keyboard support (Enter to search)
 * - Optional search button
 * - Customizable placeholder and styling
 * - Disabled state support
 * - Instant search capability
 * 
 * @param props - SearchBar configuration options
 * @returns JSX.Element - Rendered search bar component
 */
const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  className = "",
  showSearchButton = true,
  disabled = false,
  instantSearch = false,
}) => {
  /**
   * Handles keyboard events, specifically Enter key for search
   * Memoized to prevent unnecessary re-renders
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      e.preventDefault();
      onSearch();
    }
  }, [onSearch]);

  /**
   * Handles input value changes
   * Supports instant search if enabled
   */
  const handleInputChange = useCallback((e: InputChangeEvent) => {
    const newValue = e.value || '';
    onChange(newValue);
    
    // Trigger instant search if enabled and callback is provided
    if (instantSearch && onSearch && newValue.trim()) {
      onSearch();
    }
  }, [onChange, onSearch, instantSearch]);

  /**
   * Handles search button click
   * Prevents event propagation to avoid conflicts
   */
  const handleSearchClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch();
    }
  }, [onSearch]);

  /**
   * Memoized CSS classes to prevent unnecessary recalculations
   */
  const containerClasses = useMemo(() => 
    `search-bar ${className}`.trim(), 
    [className]
  );

  return (
    <div className={containerClasses}>
      <div className="search-input-container">
        <Input
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="search-input"
          aria-label={placeholder}
          role="searchbox"
        />
        {showSearchButton && (
          <Button
            onClick={handleSearchClick}
            disabled={disabled || !value.trim()}
            themeColor="primary"
            size="medium"
            className="search-button"
            aria-label="Search"
            title="Search"
          >
            🔍
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
