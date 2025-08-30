import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Notification, NotificationGroup } from '@progress/kendo-react-notification';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import type { User } from '@/types';
import { ROUTES , API_ENDPOINTS} from '@/constants';

const ROLES = [
  { value: 'user', label: 'User' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Administrator' },
];

const initialForm = {
  email: '',
  username: '',
  first_name: '',
  last_name: '',
  password: '',
  password_confirm: '',
  role: 'user',
};

const fetchUser = async (id: string) => {
  // Usa la ruta de detalle de usuario
  const url = ROUTES.USER_DETAIL.replace(':id', id);
  return api.get<User>(url);
};

const createUser = async (data: any) => {
  return api.post(API_ENDPOINTS.USERS, data); // <-- Aquí
};

const updateUser = async ({ id, data }: { id: string; data: any }) => {
  return api.patch(`${API_ENDPOINTS.USERS}${id}/`, data);
};

const UserCreatePage: React.FC = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Query for user data if editing
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && userData) {
      setForm({
        ...initialForm,
        ...userData,
        password: '',
        password_confirm: '',
        role: userData.role || 'user',
      });
    }
  }, [isEditMode, userData]);

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      setSuccess('User created!');
      setTimeout(() => navigate(ROUTES.USERS), 1200);
    },
    onError: (err: any) => {
      setError(
        err?.response?.data?.detail ||
        'Error creating user. Please check the fields.'
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      setSuccess('User updated!');
    },
    onError: (err: any) => {
      setError(
        err?.response?.data?.detail ||
        'Error updating user. Please check the fields.'
      );
    },
  });

  const handleChange = (e: any) => {
      setForm({ ...form, [e.target.props.name]: e.value });
  };

  const handleRoleChange = (e: any) => {
    setForm({ ...form, role: e.value.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    if (isEditMode) {
      const { password, password_confirm, ...rest } = form;
      const data = password
        ? { ...rest, password, password_confirm }
        : rest;
      if (id) {
        updateMutation.mutate({ id, data });
      } else {
        setError('User ID is missing.');
      }
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <Card>
        <CardBody>
          <h2 style={{ marginBottom: 24 }}>
            {isEditMode ? 'Edit User' : 'Create User'}
          </h2>
          <form autoComplete="on" onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <Input
                name="email"
                label="Email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                style={{ width: '100%' }}
                disabled={isEditMode}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Input
                name="username"
                label="Username"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
                style={{ width: '100%' }}
                disabled={isEditMode}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Input
                name="first_name"
                label="First Name"
                value={form.first_name}
                onChange={handleChange}
                required
                autoComplete="given-name"
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Input
                name="last_name"
                label="Last Name"
                value={form.last_name}
                onChange={handleChange}
                required
                autoComplete="family-name"
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <DropDownList
                data={ROLES}
                textField="label"
                dataItemKey="value"
                value={ROLES.find(r => r.value === form.role)}
                onChange={handleRoleChange}
                label="Role"
                style={{ width: '100%' }}
                disabled={form.role === 'admin' && !isEditMode}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Input
                name="password"
                label={isEditMode ? 'New Password (leave blank to keep)' : 'Password'}
                type="password"
                value={form.password}
                onChange={handleChange}
                autoComplete={isEditMode ? 'new-password' : 'new-password'}
                style={{ width: '100%' }}
                required={!isEditMode}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Input
                name="password_confirm"
                label="Confirm Password"
                type="password"
                value={form.password_confirm}
                onChange={handleChange}
                autoComplete={isEditMode ? 'new-password' : 'new-password'}
                style={{ width: '100%' }}
                required={!isEditMode}
              />
            </div>
            <Button
              type="submit"
              themeColor="primary"
              disabled={createMutation.isPending || updateMutation.isPending || isLoading}
              style={{ marginTop: 16 }}
            >
              {(createMutation.isPending || updateMutation.isPending || isLoading)
                ? (isEditMode ? 'Saving...' : 'Creating...')
                : isEditMode ? 'Save Changes' : 'Create User'}
            </Button>
            <Button
                themeColor="secondary"
                onClick={() => navigate(-1)}
                style={{ marginTop: 8, marginRight: 8 }}
                >
                Go Back
                </Button>
          </form>
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

export default UserCreatePage;