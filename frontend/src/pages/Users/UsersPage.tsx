import React from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/constants';
import type { User } from '@/types';

const fetchUsers = async (): Promise<User[]> => {
  const res = await api.get(API_ENDPOINTS.USERS);
  // Si la API devuelve { results: [...] }
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.results)) return res.results;
  return [];
};

const UsersPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  return (
    <div className="users-page">
      <h1>Users Management</h1>
      <Button
        themeColor="primary"
        onClick={() => navigate('/users/create')}
        style={{ marginBottom: 16 }}
      >
        Create User
      </Button>
      <Grid
        data={users}
        style={{ height: 500, cursor: 'pointer' }}
        onRowClick={e => navigate(`/users/${e.dataItem.id}`)}
        loading={isLoading}
      >
        <GridColumn field="id" title="ID" width="60px" />
        <GridColumn field="username" title="Username" />
        <GridColumn field="email" title="Email" />
        <GridColumn field="first_name" title="First Name" />
        <GridColumn field="last_name" title="Last Name" />
        <GridColumn
          title="Actions"
          cell={props => (
            <td>
              <Button
                size="small"
                onClick={ev => {
                  ev.stopPropagation();
                  navigate(`/users/${props.dataItem.id}`);
                }}
              >
                View
              </Button>
            </td>
          )}
        />
      </Grid>
    </div>
  );
};

export default UsersPage;