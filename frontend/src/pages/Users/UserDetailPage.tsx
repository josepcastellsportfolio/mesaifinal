import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { Notification, NotificationGroup } from '@progress/kendo-react-notification';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { API_ENDPOINTS, ROUTES } from '@/constants';
import type { User } from '@/types';

const fetchUser = async (id: string) => {
  return api.get<User>(`${API_ENDPOINTS.USERS}${id}/`);
};

const deleteUser = async (id: string) => {
  return api.delete(`${API_ENDPOINTS.USERS}${id}/`);
};

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      setSuccess('User deleted!');
      setTimeout(() => navigate(ROUTES.USERS), 1200);
    },
    onError: (err: any) => {
      setError(
        err?.response?.data?.detail ||
        'Error deleting user.'
      );
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(id!);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <Card>
        <CardBody>
          <h2>User Detail</h2>
          <div style={{ marginBottom: 16 }}>
            <strong>Username:</strong> {user.username}
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Email:</strong> {user.email}
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>First Name:</strong> {user.first_name}
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Last Name:</strong> {user.last_name}
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Role:</strong> {user.role}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <Button
              themeColor="primary"
              onClick={() => navigate(`/users/${user.id}/edit`)}
            >
              Edit
            </Button>
            <Button
              themeColor="error"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
            <Button
              onClick={() => navigate(ROUTES.USERS)}
              themeColor="secondary"
            >
              Back to List
            </Button>
          </div>
          <NotificationGroup style={{ right: 24, bottom: 24 }}>
            {success && (
              <Notification type={{ style: 'success', icon: true }}>
                {success}
              </Notification>
            )}
            {error && (
              <Notification type={{ style: 'error', icon: true }}>
                {error}
              </Notification>
            )}
          </NotificationGroup>
        </CardBody>
      </Card>
    </div>
  );
};

export default UserDetailPage;