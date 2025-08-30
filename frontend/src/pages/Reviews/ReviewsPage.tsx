import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { useReviews } from '@/queries';
import { ROUTES } from '@/constants';
import SearchBar from '@/components/common/SearchBar/SearchBar';
import FilterPanel, { type FilterConfig } from '@/components/common/FilterPanel/FilterPanel';
import { Grid, GridColumn } from '@progress/kendo-react-grid';

const ReviewsPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string | number | boolean | null>>({
    is_approved: null,
    is_verified_purchase: null,
    rating: null,
    ordering: '-created_at',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showFilters, setShowFilters] = useState(true);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  const { data: reviewsData, isLoading } = useReviews({
    search: searchTerm,
    ...filters,
    page,
    page_size: pageSize,
  });


  const handleToggleFilters = () => {
    setShowFilters((prev) => !prev);
    // Si ocultas los filtros, también colapsa el panel
    if (showFilters) setIsFilterCollapsed(false);
  };

  const handleToggleFilterCollapse = () => {
    setIsFilterCollapsed((prev) => !prev);
  };

  const reviews = reviewsData?.results || [];
  const total = reviewsData?.count || 0;

  const filterConfigs: FilterConfig[] = [
    {
      type: 'boolean',
      key: 'is_approved',
      label: 'Approval Status',
    },
    {
      type: 'boolean',
      key: 'is_verified_purchase',
      label: 'Verified Purchase',
    },
    {
      type: 'select',
      key: 'rating',
      label: 'Rating',
      options: [
        { label: '5 Stars', value: 5 },
        { label: '4 Stars', value: 4 },
        { label: '3 Stars', value: 3 },
        { label: '2 Stars', value: 2 },
        { label: '1 Star', value: 1 },
      ],
    },
    {
      type: 'select',
      key: 'ordering',
      label: 'Sort by',
      options: [
        { label: 'Newest First', value: '-created_at' },
        { label: 'Oldest First', value: 'created_at' },
        { label: 'Highest Rating', value: '-rating' },
        { label: 'Lowest Rating', value: 'rating' },
        { label: 'Most Helpful', value: '-helpful_votes' },
      ],
    },
  ];

return (
    <div className="reviews-page">
      <div className="page-header">
        {/* ...header-content... */}
        <div className="header-actions">
          <Button
            onClick={() => navigate(ROUTES.REVIEW_CREATE)}
            themeColor="primary"
            size="large"
          >
            ➕ Add Review
          </Button>
          <Button
            onClick={handleToggleFilters}
            themeColor="secondary"
            size="small"
            style={{ marginLeft: 8 }}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>

      <div className="page-content">
        {showFilters && (
          <div className="filters-section">
            <div className="search-section">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={() => setPage(1)}
                placeholder="Search reviews by title, content, or reviewer..."
                className="reviews-search"
              />
            </div>
            <FilterPanel
              filters={filterConfigs}
              values={filters}
              onChange={(key, value) => {
                setFilters(prev => ({ ...prev, [key]: value }));
                setPage(1);
              }}
              onReset={() => {
                setFilters({
                  is_approved: null,
                  is_verified_purchase: null,
                  rating: null,
                  ordering: '-created_at',
                });
                setSearchTerm('');
                setPage(1);
              }}
              title="Filter Reviews"
              className="reviews-filters"
              collapsible={true}
              isCollapsed={isFilterCollapsed}
              onToggleCollapse={handleToggleFilterCollapse}
            />
          </div>
        )}

        <Card className="reviews-content-card">
          <CardBody>
            <Grid
              data={reviews}
              skip={(page - 1) * pageSize}
              take={pageSize}
              total={total}
              pageable
              pageSize={pageSize}
              onPageChange={e => {
                setPage(e.page.skip / e.page.take + 1);
                setPageSize(e.page.take);
              }}
              loading={isLoading}
              style={{ minHeight: 400 }}
              onRowClick={e => navigate(`/reviews/${e.dataItem.id}`)}
            >
              <GridColumn field="title" title="Review" width="200px" />
              <GridColumn field="rating" title="Rating" width="100px" />
              <GridColumn field="product_name" title="Product" width="150px" />
              <GridColumn field="user_name" title="Reviewer" width="120px" />
              <GridColumn field="is_approved" title="Status" width="100px" />
              <GridColumn field="helpful_votes" title="Helpful" width="80px" />
              <GridColumn field="created_at" title="Date" width="120px" />
            </Grid>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ReviewsPage;