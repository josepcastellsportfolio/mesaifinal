"""
User views and ViewSets for API endpoints.
Implements CRUD operations, authentication, and user management.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import get_user_model
from django.db.models import Q

from .models import UserProfile
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    RegisterSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
)
from .permissions import IsOwnerOrAdmin

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view with better error messages.
    Provides specific feedback for different authentication failures.
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        """Handle login with custom error handling."""
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            # Return structured error response
            if hasattr(e, 'detail') and isinstance(e.detail, dict):
                return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(
                    {'non_field_errors': ['Invalid credentials provided.']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User model with comprehensive CRUD operations.
    Includes custom actions for profile management and user statistics.
    """
    
    queryset = User.objects.select_related('profile').all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'username', 'email']
    ordering = ['-date_joined']
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on action.
        Uses different serializers for different operations to optimize performance.
        """
        if self.action == 'list':
            return UserProfileSerializer
        elif self.action == 'register':
            return RegisterSerializer
        elif self.action in ['update_profile', 'profile']:
            return UserProfileSerializer
        elif self.action == 'change_password':
            return ChangePasswordSerializer
        return UserSerializer
    
    def get_permissions(self):
        """
        Instantiate and return the list of permissions required for this view.
        Different actions require different permission levels.
        """
        if self.action == 'register':
            permission_classes = [AllowAny]
        elif self.action in ['retrieve', 'update', 'partial_update', 'update_profile']:
            permission_classes = [IsOwnerOrAdmin]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter queryset based on user permissions and query parameters.
        Regular users can only see their own data, admins see everything.
        """
        queryset = super().get_queryset()
        
        if not self.request.user.is_staff and not self.request.user.is_admin():
            # Regular users can only see their own profile
            if self.action in ['retrieve', 'update', 'partial_update']:
                queryset = queryset.filter(id=self.request.user.id)
            else:
                # For list view, show only active users (public directory)
                queryset = queryset.filter(is_active=True)
        
        return queryset
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """
        Custom action for user registration.
        Allows anonymous users to create new accounts.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    'message': 'User registered successfully',
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get', 'patch'])
    def profile(self, request, pk=None):
        """
        Custom action for user profile management.
        GET: Retrieve user profile information
        PATCH: Update user profile information
        """
        user = self.get_object()
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        if request.method == 'GET':
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Custom action to get current user's information.
        Returns detailed information about the authenticated user.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_profile(self, request):
        """
        Custom action to update current user's profile.
        Allows authenticated users to update their own profile information.
        """
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def statistics(self, request):
        """
        Custom action for user statistics (admin only).
        Returns various statistics about users in the system.
        """
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        admin_users = User.objects.filter(role=User.Role.ADMIN).count()
        manager_users = User.objects.filter(role=User.Role.MANAGER).count()
        regular_users = User.objects.filter(role=User.Role.USER).count()
        
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': total_users - active_users,
            'users_by_role': {
                'admin': admin_users,
                'manager': manager_users,
                'user': regular_users,
            }
        })
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """
        Custom action to change user password.
        Requires current password for security.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

