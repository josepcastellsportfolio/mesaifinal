"""
Tests for users app.
Includes unit tests for models, serializers, and API endpoints.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import UserProfile

User = get_user_model()


class UserModelTest(TestCase):
    """Test cases for User model."""
    
    def setUp(self):
        """Set up test data."""
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'testpass123'
        }
    
    def test_create_user(self):
        """Test creating a new user."""
        user = User.objects.create_user(**self.user_data)
        
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.full_name, 'Test User')
        self.assertEqual(user.role, User.Role.USER)
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
    
    def test_create_user_profile_signal(self):
        """Test that user profile is created automatically."""
        user = User.objects.create_user(**self.user_data)
        
        self.assertTrue(hasattr(user, 'profile'))
        self.assertIsInstance(user.profile, UserProfile)
    
    def test_user_str_representation(self):
        """Test user string representation."""
        user = User.objects.create_user(**self.user_data)
        expected_str = f"Test User (test@example.com)"
        
        self.assertEqual(str(user), expected_str)
    
    def test_user_role_methods(self):
        """Test user role checking methods."""
        # Test regular user
        user = User.objects.create_user(**self.user_data)
        self.assertFalse(user.is_admin())
        self.assertFalse(user.is_manager())
        
        # Test admin user
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            role=User.Role.ADMIN
        )
        self.assertTrue(admin_user.is_admin())
        self.assertFalse(admin_user.is_manager())
        
        # Test manager user
        manager_user = User.objects.create_user(
            username='manager',
            email='manager@example.com',
            first_name='Manager',
            last_name='User',
            role=User.Role.MANAGER
        )
        self.assertFalse(manager_user.is_admin())
        self.assertTrue(manager_user.is_manager())


class UserAPITest(APITestCase):
    """Test cases for User API endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        
        self.user = User.objects.create_user(
            username='existing',
            email='existing@example.com',
            first_name='Existing',
            last_name='User',
            password='existingpass123'
        )
    
    def get_jwt_token(self, user):
        """Helper method to get JWT token for user."""
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)
    
    def test_user_registration(self):
        """Test user registration endpoint."""
        url = reverse('users:user-register')
        response = self.client.post(url, self.user_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user_id', response.data)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')
        
        # Verify user was created
        user = User.objects.get(username='testuser')
        self.assertEqual(user.email, 'test@example.com')
    
    def test_user_registration_password_mismatch(self):
        """Test registration with password mismatch."""
        invalid_data = self.user_data.copy()
        invalid_data['password_confirm'] = 'different_password'
        
        url = reverse('users:user-register')
        response = self.client.post(url, invalid_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password_confirm', response.data)
    
    def test_user_registration_duplicate_email(self):
        """Test registration with duplicate email."""
        invalid_data = self.user_data.copy()
        invalid_data['email'] = self.user.email  # Use existing email
        
        url = reverse('users:user-register')
        response = self.client.post(url, invalid_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_get_current_user(self):
        """Test getting current user information."""
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = reverse('users:user-me')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['email'], self.user.email)
    
    def test_get_current_user_unauthorized(self):
        """Test getting current user without authentication."""
        url = reverse('users:user-me')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_update_user_profile(self):
        """Test updating user profile."""
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        profile_data = {
            'date_of_birth': '1990-01-01',
            'city': 'Test City',
            'country': 'Test Country'
        }
        
        url = reverse('users:user-update-profile')
        response = self.client.patch(url, profile_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['city'], 'Test City')
        self.assertEqual(response.data['country'], 'Test Country')
        
        # Verify profile was updated
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.city, 'Test City')
    
    def test_jwt_authentication(self):
        """Test JWT token authentication."""
        # Get tokens
        login_url = reverse('token_obtain_pair')
        login_data = {
            'email': self.user.email,
            'password': 'existingpass123'
        }
        
        response = self.client.post(login_url, login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
        # Use access token to access protected endpoint
        access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        url = reverse('users:user-me')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_user_list_permission(self):
        """Test user list requires authentication."""
        url = reverse('users:user-list')
        
        # Without authentication
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # With authentication
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

