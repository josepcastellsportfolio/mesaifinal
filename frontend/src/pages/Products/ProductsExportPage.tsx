import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { Checkbox } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { ROUTES } from '@/constants';

const ProductsExportPage: React.FC = () => {
  const navigate = useNavigate();
  const [exportFormat, setExportFormat] = useState('csv');
  const [includeFields, setIncludeFields] = useState({
    basic_info: true,
    pricing: true,
    inventory: true,
    categories: true,
    tags: true,
    reviews: false,
  });

  const formatOptions = [
    { text: 'CSV Format', value: 'csv' },
    { text: 'Excel Format', value: 'xlsx' },
    { text: 'JSON Format', value: 'json' },
  ];

  const handleExport = () => {
    // Implementation would go here
    console.log('Exporting with format:', exportFormat, 'fields:', includeFields);
  };

  return (
    <div className="export-page">
      <div className="page-header">
        <div className="header-content">
          <h1>📤 Export Products</h1>
          <p>Export your product data in various formats</p>
        </div>
        <div className="header-actions">
          <Button
            onClick={() => navigate(ROUTES.PRODUCTS)}
            fillMode="outline"
            size="large"
          >
            ← Back to Products
          </Button>
        </div>
      </div>

      <div className="page-content">
        <Card>
          <CardBody>
            <div className="export-section">
              <h3>Export Options</h3>
              
              <div className="form-field">
                <label>Export Format</label>
                <DropDownList
                  data={formatOptions}
                  textField="text"
                  dataItemKey="value"
                  value={formatOptions.find(opt => opt.value === exportFormat)}
                  onChange={(e) => setExportFormat(e.value.value)}
                />
              </div>

              <div className="form-field">
                <label>Include Fields</label>
                <div className="checkbox-group">
                  <Checkbox
                    checked={includeFields.basic_info}
                    onChange={(e) => setIncludeFields(prev => ({
                      ...prev,
                      basic_info: e.value
                    }))}
                    label="Basic Information (name, description, SKU)"
                  />
                  <Checkbox
                    checked={includeFields.pricing}
                    onChange={(e) => setIncludeFields(prev => ({
                      ...prev,
                      pricing: e.value
                    }))}
                    label="Pricing (price, cost)"
                  />
                  <Checkbox
                    checked={includeFields.inventory}
                    onChange={(e) => setIncludeFields(prev => ({
                      ...prev,
                      inventory: e.value
                    }))}
                    label="Inventory (stock quantity)"
                  />
                  <Checkbox
                    checked={includeFields.categories}
                    onChange={(e) => setIncludeFields(prev => ({
                      ...prev,
                      categories: e.value
                    }))}
                    label="Categories"
                  />
                  <Checkbox
                    checked={includeFields.tags}
                    onChange={(e) => setIncludeFields(prev => ({
                      ...prev,
                      tags: e.value
                    }))}
                    label="Tags"
                  />
                  <Checkbox
                    checked={includeFields.reviews}
                    onChange={(e) => setIncludeFields(prev => ({
                      ...prev,
                      reviews: e.value
                    }))}
                    label="Reviews and Ratings"
                  />
                </div>
              </div>

              <Button
                onClick={handleExport}
                themeColor="primary"
                size="large"
              >
                📥 Export Products
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ProductsExportPage;
