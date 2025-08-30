"""
API URL configuration.
Centralizes all API endpoints with versioning support.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from apps.users.views import CustomTokenObtainPairView

# Initialize DRF router for ViewSets
router = DefaultRouter()

# Import and register ViewSets from apps
from apps.users.views import UserViewSet
from apps.core.views import CategoryViewSet, ProductViewSet, TagViewSet, ReviewViewSet

router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'tags', TagViewSet)
router.register(r'reviews', ReviewViewSet)


urlpatterns = [
    # JWT Authentication endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Include router URLs
    path('', include(router.urls)),
    
    # Include app-specific URLs
    path('users/', include('apps.users.urls')),
    path('core/', include('apps.core.urls')),
]

