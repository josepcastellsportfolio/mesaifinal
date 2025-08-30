import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Input } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { useCategories } from '@/queries';
import { ROUTES, PAGINATION } from '@/constants';
import type { GridCellProps, GridSelectionChangeEvent } from '@progress/kendo-react-grid';
import type { InputChangeEvent } from '@progress/kendo-react-inputs';
import type { Category } from '@/types';
import './CategoriesPage.css';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  
  // STATE MANAGEMENT
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedItem, setSelectedItem] = useState<Category | null>(null);
  const [filters, setFilters] = useState({
    parent: null as number | null,
    is_active: undefined as boolean | undefined
  });

  // DATA FETCHING
  const { data, isLoading } = useCategories(
    { search, ...filters },
    { page, page_size: PAGINATION.DEFAULT_PAGE_SIZE }
  );

  const categories = data?.results || [];

  // EVENT HANDLERS
  const handleSearchChange = (e: InputChangeEvent) => {
    setSearch((e.target?.value as string) || '');
    setPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filterType: 'parent' | 'is_active', value: number | null | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      parent: null,
      is_active: undefined
    });
    setSearch('');
    setPage(1);
  };

  const handleRowSelect = (event: GridSelectionChangeEvent) => {
    const selectedIds = event.dataItems.map((row: Category) => row.id);
    setSelectedRows(selectedIds);
    
    // Set the selected item for single selection
    if (selectedIds.length === 1) {
      const selectedCategory = categories.find(cat => cat.id === selectedIds[0]);
      setSelectedItem(selectedCategory || null);
    } else {
      setSelectedItem(null);
    }
  };

  const handleNameClick = (category: Category) => {
    navigate(ROUTES.CATEGORY_DETAIL.replace(':slug', category.slug));
  };

  const handleEditSelected = () => {
    if (selectedItem) {
      navigate(ROUTES.CATEGORY_EDIT.replace(':slug', selectedItem.slug));
    }
  };

  // DATA PREPARATION
  const categoriesWithSelection = categories.map(category => ({
    ...category,
    className: selectedRows.includes(category.id) ? 'selected-row' : ''
  }));

  // ERROR HANDLING
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <h2>Loading categories...</h2>
        </div>
      </div>
    );
  }

  // RENDER
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Categories</h1>
          <p>Manage categories and structure your catalog</p>
          {selectedItem && (
            <div className="selection-indicator">
              Selected: {selectedItem.name}
            </div>
          )}
        </div>
        <div className="header-actions">
          {selectedItem && (
            <Button 
              themeColor="success" 
              onClick={handleEditSelected}
              className="edit-selected-button"
            >
              Edit Selected Category
            </Button>
          )}
          <Button themeColor="primary" onClick={() => navigate(ROUTES.CATEGORY_CREATE)}>
            Create Category
          </Button>
        </div>
      </div>

      <div className="page-content">
        <div className="content-toolbar">
          <div className="toolbar-left">
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={handleSearchChange}
              style={{ width: '280px' }}
            />
          </div>
          <div className="toolbar-right">
            <Button 
              themeColor="secondary" 
              onClick={clearFilters}
              size="small"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="filters-panel">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filters.is_active === undefined ? '' : filters.is_active.toString()}
              onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="filter-select"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Parent Category:</label>
            <select 
              value={filters.parent || ''}
              onChange={(e) => handleFilterChange('parent', e.target.value === '' ? null : parseInt(e.target.value))}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="null">Root Categories</option>
              {/* TODO: Add parent categories dropdown */}
            </select>
          </div>
        </div>

        <Grid 
          data={categoriesWithSelection} 
          style={{ height: '600px' }}
          selectable={{ mode: 'single' }}
          onSelectionChange={handleRowSelect}
          navigatable={true}
        >
          <GridColumn 
            field="name" 
            title="Name" 
            width="240px"
            cells={{
              data: (props: GridCellProps) => (
                <td 
                  className="name-cell"
                  onClick={() => handleNameClick(props.dataItem)}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {props.dataItem.name}
                </td>
              )
            }}
          />
          <GridColumn field="slug" title="Slug" width="200px" />
          <GridColumn field="product_count" title="Products" width="120px" />
          <GridColumn 
            field="is_active" 
            title="Active" 
            width="100px" 
            cell={(props: GridCellProps) => (
              <td>{props.dataItem.is_active ? 'Yes' : 'No'}</td>
            )} 
          />
        </Grid>
      </div>
    </div>
  );
};

export default CategoriesPage;
