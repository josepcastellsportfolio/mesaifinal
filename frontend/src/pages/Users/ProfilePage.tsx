import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { Notification, NotificationGroup } from '@progress/kendo-react-notification';
import { useAuthStore } from '@/store/auth.store';
import { useCurrentUser, useUpdateProfile } from '@/queries/auth.queries';
import { ROUTES } from '@/constants';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });
  const [formInitialized, setFormInitialized] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && !formInitialized) {
      setForm({
        username: currentUser.username || '',
        email: currentUser.email || '',
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
      });
      setFormInitialized(true);
    }
  }, [currentUser, formInitialized]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    updateProfile.mutate(form, {
      onSuccess: (updatedUser) => {
        setSuccess('Perfil actualizado');
        setUser(updatedUser); // Actualiza el store para el header
        navigate(ROUTES.DASHBOARD); // Redirige al dashboard
      },
      onError: () => {
        setError('Error al actualizar el perfil');
      }
    });
  };

  if (userLoading || !formInitialized) return <div className="profile-loading">Cargando...</div>;

  return (
    <div className="profile-page-container">
      <Card className="profile-card">
        <CardBody>
          <h2 className="profile-title">Mi perfil</h2>
          <form onSubmit={handleSubmit} className="profile-form">
            <Input
              name="username"
              label="Usuario"
              value={form.username}
              onChange={handleChange}
              disabled
              style={{ width: '100%' }}
            />
            <Input
              name="email"
              label="Email"
              value={form.email}
              onChange={handleChange}
              disabled
              style={{ width: '100%' }}
            />
            <Input
              name="first_name"
              label="Nombre"
              value={form.first_name}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
            <Input
              name="last_name"
              label="Apellidos"
              value={form.last_name}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
            <Button
              type="submit"
              themeColor="primary"
              size="large"
              className="profile-submit-btn"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? 'Guardando...' : 'Guardar'}
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

export default ProfilePage;