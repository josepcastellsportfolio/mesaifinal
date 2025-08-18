"""
User models with custom user model extending Django's AbstractUser.
Includes profile information and role-based permissions.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator


class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.
    Adds additional fields for profile information and role management.
    """
    
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Administrator'
        MANAGER = 'manager', 'Manager'
        USER = 'user', 'User'
    
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.USER,
        help_text="User role for permission management"
    )
    phone_number = models.CharField(
        max_length=17,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ]
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        help_text="User profile picture"
    )
    bio = models.TextField(
        max_length=500,
        blank=True,
        help_text="Short biography or description"
    )
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email as the unique identifier for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def full_name(self):
        """Return the full name of the user."""
        return f"{self.first_name} {self.last_name}".strip()
    
    def is_admin(self):
        """Check if user has admin role."""
        return self.role == self.Role.ADMIN
    
    def is_manager(self):
        """Check if user has manager role."""
        return self.role == self.Role.MANAGER


class UserProfile(models.Model):
    """
    Extended user profile model for additional user information.
    Uses OneToOne relationship with User model.
    """
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    date_of_birth = models.DateField(
        null=True,
        blank=True,
        help_text="User's date of birth"
    )
    address = models.TextField(
        max_length=200,
        blank=True,
        help_text="User's address"
    )
    city = models.CharField(
        max_length=50,
        blank=True,
        help_text="User's city"
    )
    country = models.CharField(
        max_length=50,
        blank=True,
        help_text="User's country"
    )
    website = models.URLField(
        blank=True,
        help_text="User's personal website"
    )
    linkedin_profile = models.URLField(
        blank=True,
        help_text="User's LinkedIn profile URL"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"Profile of {self.user.full_name}"

