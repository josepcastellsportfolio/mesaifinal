import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Kendo imports removed
import { useTags } from '@/queries';
import { ROUTES } from '@/constants';
import SearchBar from '@/components/common/SearchBar/SearchBar';
import FilterPanel from '@/components/common/FilterPanel/FilterPanel';
import type { FilterConfig } from '@/components/common/FilterPanel/FilterPanel';
import type { Tag } from '@/types';
import './TagsPage.css';
import { Grid, GridColumn, type GridCellProps, type GridSelectionChangeEvent } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { Card, CardBody } from '@progress/kendo-react-layout';

/**
 * TagsPage Component
 * 
 * Manages the display and interaction with tags in a table format.
 * Features:
 * - Search and filter tags
 * - Row selection for editing
 * - Clickable tag names for viewing details
 * - Visual feedback for selected rows
 */
const TagsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // ===== STATE MANAGEMENT =====
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string | number | boolean | null>>({
    is_active: null,
    ordering: '-created_at',
  });
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedItem, setSelectedItem] = useState<Tag | null>(null);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  // ===== DATA FETCHING =====
  const { data: tagsData, isLoading } = useTags({
    search: searchTerm,
    ...filters,
    page,
    page_size: 20,
  });

  const tags = tagsData?.results || [];

  // ===== FILTER CONFIGURATION =====
  const filterConfigs: FilterConfig[] = [
    {
      type: 'boolean',
      key: 'is_active',
      label: 'Status',
    },
    {
      type: 'select',
      key: 'ordering',
      label: 'Sort by',
      options: [
        { label: 'Newest First', value: '-created_at' },
        { label: 'Oldest First', value: 'created_at' },
        { label: 'Name A-Z', value: 'name' },
        { label: 'Name Z-A', value: '-name' },
        { label: 'Most Products', value: '-product_count' },
        { label: 'Least Products', value: 'product_count' },
      ],
    },
  ];

  // ===== EVENT HANDLERS =====
  
  /**
   * Navigate to tag details page
   */
  const handleViewTag = (tag: Tag) => {
    navigate(`/tags/${tag.slug}`);
  };

  /**
   * Handle search functionality
   */
  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: string, value: unknown) => {
    // Removed redundant line with undefined 'castValue'
    setFilters(prev => ({ ...prev, [key]: value as string | number | boolean | null }));
    setPage(1);
  };

  /**
   * Reset all filters to default state
   */
  const handleResetFilters = () => {
    setFilters({
      is_active: null,
      ordering: '-created_at',
    });
    setSearchTerm('');
    setPage(1);
  };

  /**
   * Handle row selection in the grid
   */
  const handleRowSelect = (event: GridSelectionChangeEvent) => {
    if (event?.dataItem?.id) {
      const selectedId = event.dataItem.id;
      setSelectedRows([selectedId]);
      setSelectedItem(event.dataItem as Tag);
    } else if (event?.dataItems && event.dataItems.length > 0) {
      const selectedIds = event.dataItems.map((item: Record<string, unknown>) => item.id as number);
      setSelectedRows(selectedIds);
      setSelectedItem(event.dataItems[0] as Tag);
    } else {
      setSelectedRows([]);
      setSelectedItem(null);
    }
  };

  /**
   * Handle clicking on tag name cell (navigate to details)
   */
  const handleNameClick = (tag: Tag) => {
    handleViewTag(tag);
  };

  /**
   * Navigate to edit form with selected tag data
   */
  const handleEditSelectedTag = () => {
    if (selectedItem) {
      const tagData = encodeURIComponent(JSON.stringify(selectedItem));
      navigate(`${ROUTES.TAG_CREATE}?edit=${tagData}`);
    }
  };

  /**
   * Toggle filter panel collapse state
   */
  const handleToggleFilterCollapse = () => {
    setIsFilterCollapsed(!isFilterCollapsed);
  };

  // ===== UTILITY FUNCTIONS =====
  
  /**
   * Calculate contrast color for text readability on colored backgrounds
   */
  const getContrastColor = (hexColor: string): string => {
    const color = hexColor.replace('#', '');
    const fullHex = color.length === 3 
      ? color.split('').map(char => char + char).join('')
      : color;
    
    const r = parseInt(fullHex.substr(0, 2), 16);
    const g = parseInt(fullHex.substr(2, 2), 16);
    const b = parseInt(fullHex.substr(4, 2), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // ===== DATA PREPARATION =====
  
  /**
   * Prepare tags data with selection state for grid display
   */
  const tagsWithSelection = tags.map(tag => ({
    ...tag,
    className: selectedRows.includes(tag.id) ? 'selected-row' : ''
  }));

  // ===== RENDER =====
  return (
    <div className="tags-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Tags Management</h1>
          <p>
            Manage product tags and categories
            {selectedRows.length === 1 && (
              <span className="selection-indicator">
                • {selectedItem?.name || 'Selected tag'} is selected
              </span>
            )}
          </p>
        </div>
        <div className="header-actions">
          {selectedRows.length === 1 ? (
            <Button 
              onClick={handleEditSelectedTag}
              themeColor="success"
              size="large"
              className="edit-selected-button"
            >
              ✏️ Edit Selected Tag
            </Button>
          ) : (
            <Button
              onClick={() => navigate(ROUTES.TAG_CREATE)}
              themeColor="primary"
              size="large"
            >
              ➕ Create Tag
            </Button>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">
        {/* Filters Section */}
        <div className="filters-section">
          <div className="search-section">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearch}
              placeholder="Search tags by name..."
              className="tags-search"
            />
          </div>

          <FilterPanel
            filters={filterConfigs}
            values={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            title="Filter Tags"
            className="tags-filters"
            collapsible={true}
            isCollapsed={isFilterCollapsed}
            onToggleCollapse={handleToggleFilterCollapse}
          />
        </div>

        {/* Tags Table */}
        <Card className="tags-table-card">
          <CardBody>
            <Grid
              data={isLoading ? [] : tagsWithSelection}
              selectable={{
                mode: 'single'
              }}
              onSelectionChange={handleRowSelect}
              style={{ height: '600px' }}
            >
              {/* Tag Name Column */}
              <GridColumn 
                field="name" 
                title="Tag" 
                cells={{
                  data: (props: GridCellProps) => (
                    <td 
                      className="tag-name-cell clickable"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNameClick(props.dataItem as Tag);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="tag-name-content">
                        <span 
                          className="tag-name-text"
                          style={{
                            backgroundColor: props.dataItem.color,
                            color: getContrastColor(props.dataItem.color),
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          {props.dataItem.name}
                        </span>
                      </div>
                    </td>
                  )
                }}
              />
              
              {/* Status Column */}
              <GridColumn 
                field="is_active" 
                title="Status" 
                width="120px"
                cells={{
                  data: (props: GridCellProps) => (
                    <td>
                      <span className={`status-badge ${props.dataItem.is_active ? 'active' : 'inactive'}`}>
                        {props.dataItem.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  )
                }}
              />
              
              {/* Product Count Column */}
        <GridColumn 
          field="product_count" 
          title="Products" 
          width="100px"
          cells={{
            data: (props: GridCellProps) => (
              <td
                className="product-count-cell clickable"
                onClick={() => {
                  // Navega usando el slug, no el id
                  if (props.dataItem.slug) {
                    navigate(`/products?tags=${props.dataItem.slug}`);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className="count-badge">
                  {props.dataItem.product_count || 0}
                </span>
              </td>
            )
          }}
        />
              
              {/* Created Date Column */}
              <GridColumn 
                field="created_at" 
                title="Created" 
                width="150px"
                cells={{
                  data: (props: GridCellProps) => (
                    <td>
                      {new Date(props.dataItem.created_at).toLocaleDateString()}
                    </td>
                  )
                }}
              />
            </Grid>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default TagsPage;
