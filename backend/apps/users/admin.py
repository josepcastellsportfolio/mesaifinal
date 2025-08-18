"""
Django admin configuration for User models.
Provides a comprehensive admin interface for user management.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, UserProfile


class UserProfileInline(admin.StackedInline):
    """
    Inline admin for UserProfile model.
    Allows editing profile information directly from the user admin page.
    """
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile Information'
    fields = [
        'date_of_birth',
        'address',
        'city',
        'country',
        'website',
        'linkedin_profile',
    ]


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin configuration for User model.
    Extends Django's default UserAdmin with additional fields and functionality.
    """
    
    inlines = [UserProfileInline]
    
    # Fields to display in the user list
    list_display = [
        'username',
        'email',
        'full_name',
        'role',
        'is_active',
        'is_staff',
        'date_joined',
        'avatar_preview',
    ]
    
    # Fields that can be used for filtering
    list_filter = [
        'role',
        'is_active',
        'is_staff',
        'is_superuser',
        'date_joined',
    ]
    
    # Fields that can be searched
    search_fields = [
        'username',
        'email',
        'first_name',
        'last_name',
    ]
    
    # Default ordering
    ordering = ['-date_joined']
    
    # Fields to display in the user detail/edit form
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal info', {
            'fields': (
                'first_name',
                'last_name',
                'email',
                'phone_number',
                'avatar',
                'bio',
            )
        }),
        ('Permissions', {
            'fields': (
                'role',
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            ),
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined', 'updated_at'),
        }),
    )
    
    # Fields to display when creating a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username',
                'email',
                'first_name',
                'last_name',
                'password1',
                'password2',
                'role',
                'is_active',
            ),
        }),
    )
    
    # Read-only fields
    readonly_fields = ['date_joined', 'updated_at', 'last_login']
    
    # Custom methods for admin display
    def avatar_preview(self, obj):
        """Display a small preview of the user's avatar in the admin list."""
        if obj.avatar:
            return format_html(
                '<img src="{}" width="30" height="30" style="border-radius: 50%;" />',
                obj.avatar.url
            )
        return "No avatar"
    avatar_preview.short_description = "Avatar"
    
    def full_name(self, obj):
        """Display the user's full name in the admin list."""
        return obj.full_name
    full_name.short_description = "Full Name"
    
    # Custom admin actions
    def make_active(self, request, queryset):
        """Admin action to activate selected users."""
        queryset.update(is_active=True)
        self.message_user(request, f"{queryset.count()} users have been activated.")
    make_active.short_description = "Activate selected users"
    
    def make_inactive(self, request, queryset):
        """Admin action to deactivate selected users."""
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()} users have been deactivated.")
    make_inactive.short_description = "Deactivate selected users"
    
    actions = ['make_active', 'make_inactive']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Admin configuration for UserProfile model.
    Provides a separate interface for managing user profiles.
    """
    
    list_display = [
        'user',
        'city',
        'country',
        'website',
        'created_at',
        'updated_at',
    ]
    
    list_filter = [
        'country',
        'city',
        'created_at',
    ]
    
    search_fields = [
        'user__username',
        'user__email',
        'user__first_name',
        'user__last_name',
        'city',
        'country',
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': (
                'date_of_birth',
                'address',
                'city',
                'country',
            )
        }),
        ('Online Presence', {
            'fields': (
                'website',
                'linkedin_profile',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
