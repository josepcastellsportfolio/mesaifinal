/**
 * Filter panel component that manages filters using Zustand store.
 */

import { useDashboardStore } from '../store/auth.store';

const availableFilters = [
  { id: 'sales', label: 'Sales' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'users', label: 'Users' },
  { id: 'orders', label: 'Orders' },
];

export const FilterPanel = () => {
  const { filters, addFilter, removeFilter, clearFilters } = useDashboardStore();

  const handleFilterToggle = (filterId: string) => {
    if (filters.includes(filterId)) {
      removeFilter(filterId);
    } else {
      addFilter(filterId);
    }
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <button onClick={clearFilters} className="clear-btn">
          Clear All
        </button>
      </div>
      
      <div className="filter-list">
        {availableFilters.map((filter) => (
          <label key={filter.id} className="filter-item">
            <input
              type="checkbox"
              checked={filters.includes(filter.id)}
              onChange={() => handleFilterToggle(filter.id)}
            />
            <span>{filter.label}</span>
          </label>
        ))}
      </div>
      
      <div className="filter-info">
        <p>Active filters: {filters.length}</p>
        {filters.length > 0 && (
          <p>Selected: {filters.join(', ')}</p>
        )}
      </div>
    </div>
  );
};
