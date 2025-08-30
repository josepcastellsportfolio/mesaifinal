import React from 'react';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Checkbox } from '@progress/kendo-react-inputs';
import { Slider } from '@progress/kendo-react-inputs';
import './FilterPanel.css';

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface FilterConfig {
  type: 'select' | 'multiselect' | 'checkbox' | 'range' | 'boolean';
  key: string;
  label: string;
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
}

export interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onReset: () => void;
  onApply?: () => void;
  title?: string;
  className?: string;
  collapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  values,
  onChange,
  onReset,
  onApply,
  title = "Filters",
  className = "",
  collapsible = true,
  isCollapsed = false,
  onToggleCollapse,
  
}) => {
  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <div key={filter.key} className="filter-item">
            <label className="filter-label">{filter.label}</label>
            <DropDownList
              data={filter.options || []}
              textField="label"
              dataItemKey="value"
              value={filter.options?.find(opt => opt.value === value) || null}
              onChange={(e) => onChange(filter.key, e.value?.value || null)}
              defaultItem={{ label: 'All', value: null }}
              popupSettings={{ height: 'auto', width: 'auto' }}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div key={filter.key} className="filter-item">
            <Checkbox
              checked={!!value}
              onChange={(e) => onChange(filter.key, e.value)}
                label={filter.label}
            />
          </div>
        );

      case 'boolean':
        return (
          <div key={filter.key} className="filter-item">
            <label className="filter-label">{filter.label}</label>
            <DropDownList
              data={[
                { label: 'All', value: null },
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ]}
              textField="label"
              dataItemKey="value"
              value={[
                { label: 'All', value: null },
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ].find(opt => opt.value === value) || null}
              onChange={(e) => onChange(filter.key, e.value?.value)}
            />
          </div>
        );

      case 'range':
        return (
          <div key={filter.key} className="filter-item">
            <label className="filter-label">
              {filter.label}: {(Array.isArray(value) ? value[0] : filter.min) || filter.min} - {(Array.isArray(value) ? value[1] : filter.max) || filter.max}
            </label>
            <Slider
              min={filter.min || 0}
              max={filter.max || 100}
              step={filter.step || 1}
              value={typeof value === 'number' ? value : filter.min || 0}
              onChange={(e) => onChange(filter.key, e.value)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={`filter-panel ${className}`}>
      <CardBody>
        <div className="filter-header">
          <h3 className="filter-title">{title}</h3>
          {collapsible && (
            <Button
              onClick={onToggleCollapse}
              fillMode="flat"
              size="small"
              className="collapse-button"
            >
              {isCollapsed ? '▼' : '▲'}
            </Button>
          )}
        </div>

        {!isCollapsed && (
          <>
            <div className="filter-content">
              {filters.map(renderFilter)}
            </div>

            <div className="filter-actions">
              <Button
                onClick={onReset}
                fillMode="outline"
                size="small"
                className="reset-button"
              >
                Reset
              </Button>
              {onApply && (
                <Button
                  onClick={onApply}
                  themeColor="primary"
                  size="small"
                  className="apply-button"
                >
                  Apply
                </Button>
              )}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default FilterPanel;
