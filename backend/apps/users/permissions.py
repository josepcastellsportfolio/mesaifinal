"""
Custom permissions for user-related operations.
Implements role-based access control and object-level permissions.
"""

from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to access it.
    Useful for user profile management where users can only edit their own data.
    """
    
    def has_object_permission(self, request, view, obj):
        """
        Object-level permission to only allow owners or admins to access the object.
        """
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner or admin users
        return obj == request.user or request.user.is_staff or request.user.is_admin()


class IsAdminOrManagerOrReadOnly(permissions.BasePermission):
    """
    Custom permission that allows full access to admins and managers,
    but only read access to regular users.
    """
    
    def has_permission(self, request, view):
        """
        Check if user has permission to access the view.
        """
        if not request.user.is_authenticated:
            return False
        
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for admins and managers
        return (
            request.user.is_staff or 
            request.user.is_admin() or 
            request.user.is_manager()
        )


class IsManagerOrAdmin(permissions.BasePermission):
    """
    Custom permission that only allows access to managers and admins.
    """
    
    def has_permission(self, request, view):
        """
        Check if user is manager or admin.
        """
        return (
            request.user.is_authenticated and (
                request.user.is_staff or
                request.user.is_admin() or
                request.user.is_manager()
            )
        )

