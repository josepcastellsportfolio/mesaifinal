import React from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import type { GridColumnProps, GridCellProps, GridSelectionChangeEvent, GridCellsSettings } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { PAGINATION } from '@/constants';
import './DataTable.css';

/**
 * Configuration interface for table columns
 * Extends Kendo Grid column properties with custom options
 */
export interface TableColumn extends Omit<GridColumnProps, 'field'> {
  /** Field name in the data object */
  field: string;
  /** Display title for the column header */
  title: string;
  /** Column width (string or number) */
  width?: string | number;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Whether the column is filterable */
  filterable?: boolean;
  /** Custom cell renderer function */
  cell?: (props: GridCellProps) => React.ReactNode;
  /** Format string for data display */
  format?: string;
}

/**
 * Configuration interface for row-level actions
 * Defines actions that can be performed on individual table rows
 */
export interface TableAction {
  /** Action button label */
  label: string;
  /** Optional icon identifier */
  icon?: string;
  /** Function to execute when action is clicked */
  onClick: (item: Record<string, unknown>) => void;
  /** Function to determine if action should be disabled */
  disabled?: (item: Record<string, unknown>) => boolean;
  /** Kendo theme color for the button */
  themeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** Button fill mode */
  fillMode?: 'solid' | 'outline' | 'flat';
}

/**
 * Configuration interface for bulk actions
 * Defines actions that can be performed on multiple selected rows
 */
export interface BulkAction {
  /** Action button label */
  label: string;
  /** Optional icon identifier */
  icon?: string;
  /** Function to execute when bulk action is clicked */
  onClick: (selectedItems: Record<string, unknown>[]) => void;
  /** Function to determine if bulk action should be disabled */
  disabled?: (selectedItems: Record<string, unknown>[]) => boolean;
  /** Kendo theme color for the button */
  themeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export interface DataTableProps {
  data: Record<string, unknown>[];
  columns: TableColumn[];
  loading?: boolean;
  selectable?: boolean | { mode: 'single' | 'multiple'; checkboxOnly?: boolean };
  selectedItems?: Record<string, unknown>[];
  onSelectionChange?: (selectedItems: Record<string, unknown>[]) => void;
  actions?: TableAction[];
  bulkActions?: BulkAction[];
  
  // Pagination
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  
  // Sorting
  sortable?: boolean;
  sort?: Array<{ field: string; dir: 'asc' | 'desc' }>;
  onSortChange?: (sort: Array<{ field: string; dir: 'asc' | 'desc' }>) => void;
  
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  loading = false,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  actions,
  bulkActions,
  total,
  page = 1,
  pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGINATION.PAGE_SIZE_OPTIONS,
  sortable = true,
  sort,
  onSortChange,
  className = "",
}) => {
  const hasActions = actions && actions.length > 0;
  const hasBulkActions = bulkActions && bulkActions.length > 0 && selectedItems.length > 0;

  const handleSelectionChange = (event: GridSelectionChangeEvent) => {
    if (onSelectionChange) {
      const selectedIds = event.dataItems.map(item => item.id);
      onSelectionChange(selectedIds);
    }
  };

  const renderActionCell = (props: GridCellProps) => {
    const item = props.dataItem;
    
    return (
      <div className="table-actions">
        {actions?.map((action, index) => (
          <Button
            key={index}
            onClick={() => action.onClick(item)}
            disabled={action.disabled?.(item)}
            themeColor={action.themeColor || 'primary'}
            fillMode={action.fillMode || 'flat'}
            size="small"
            title={action.label}
          >
            {action.icon && <span className={`icon-${action.icon}`}>{action.icon}</span>}
            {!action.icon && action.label}
          </Button>
        ))}
      </div>
    );
  };

  const renderBulkActions = () => {
    if (!hasBulkActions) return null;

    return (
      <div className="bulk-actions">
        <span className="selection-count">
          {selectedItems.length} item(s) selected
        </span>
        <div className="bulk-action-buttons">
          {bulkActions?.map((action, index) => (
            <Button
              key={index}
              onClick={() => action.onClick(selectedItems)}
              disabled={action.disabled?.(selectedItems)}
              themeColor={action.themeColor || 'primary'}
              size="small"
            >
              {action.icon && <span className={`icon-${action.icon}`}>{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (!total || !onPageChange) return null;

    const totalPages = Math.ceil(total / pageSize);
    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, total);

    return (
      <div className="table-pagination">
        <div className="pagination-info">
          Showing {startItem}-{endItem} of {total} items
        </div>
        
        <div className="pagination-controls">
          <DropDownList
            data={pageSizeOptions.map(size => ({ text: `${size} per page`, value: size }))}
            textField="text"
            dataItemKey="value"
            value={pageSizeOptions.map(size => ({ text: `${size} per page`, value: size })).find(opt => opt.value === pageSize)}
            onChange={(e) => onPageSizeChange?.(e.value.value)}
            className="page-size-selector"
          />
          
          <div className="page-navigation">
            <Button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              fillMode="flat"
              size="small"
            >
              Previous
            </Button>
            
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            
            <Button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              fillMode="flat"
              size="small"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`data-table ${className}`}>
      {renderBulkActions()}
      
      <Grid
        data={loading ? [] : data}
        selectable={selectable === true ? { mode: 'multiple' } : selectable || undefined}
        onSelectionChange={handleSelectionChange}
        sortable={sortable}
        sort={sort}
        onSortChange={(e) => onSortChange?.(e.sort as unknown as Array<{ field: string; dir: 'asc' | 'desc' }>)}
        className="main-grid"
      >
        {selectable && (
          <GridColumn field="selected" width="50px" />
        )}
        
        {columns.map((column) => (
          <GridColumn
            key={column.field}
            width={column.width}
            sortable={column.sortable !== false}
            filterable={column.filterable}
            cells={column.cell as unknown as GridCellsSettings}
            format={column.format}
            {...column}
          />
        ))}
        
        {hasActions && (
          <GridColumn
            field="actions"
            title="Actions"
            width="120px"
            sortable={false}
            filterable={false}
            cells={renderActionCell as unknown as GridCellsSettings}
          />
        )}
      </Grid>
      
      {loading && (
        <div className="table-loading">
          <div className="loading-spinner">Loading...</div>
        </div>
      )}
      
      {renderPagination()}
    </div>
  );
};

export default DataTable;
