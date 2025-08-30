import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { ROUTES } from '@/constants';
import './ProductsImportPage.css';

const ProductsImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileList = Array.from(files);
      setUploadedFiles(fileList);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files) {
      const fileList = Array.from(files);
      setUploadedFiles(fileList);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="import-page">
      <div className="page-header">
        <div className="header-content">
          <h1>📥 Import Products</h1>
          <p>Import products from CSV or Excel files</p>
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
            <div className="import-section">
              <h3>Upload File</h3>
              
              <div 
                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  multiple={false}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                
                <div className="upload-content">
                  <div className="upload-icon">📁</div>
                  <h4>Drag & Drop Files Here</h4>
                  <p>Or click to select files</p>
                  <Button 
                    themeColor="primary" 
                    size="medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadClick();
                    }}
                  >
                    Choose Files
                  </Button>
                </div>
              </div>

              {/* Display uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                  <h4>Selected Files:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <Button
                        fillMode="flat"
                        size="small"
                        onClick={() => handleRemoveFile(index)}
                        className="remove-file-btn"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  
                  <div className="upload-actions">
                    <Button
                      themeColor="success"
                      size="large"
                      disabled={uploadedFiles.length === 0}
                    >
                      📤 Process Import
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="import-info">
                <h4>File Requirements:</h4>
                <ul>
                  <li>Supported formats: CSV, Excel (.xlsx, .xls)</li>
                  <li>Maximum file size: 10MB</li>
                  <li>Required columns: name, price, stock_quantity, sku</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ProductsImportPage;
