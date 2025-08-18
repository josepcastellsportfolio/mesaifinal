"""
User serializers for API endpoints.
Includes user profile, authentication, and registration serializers.
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile information."""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'phone_number',
            'avatar',
            'bio',
            'is_active',
            'date_joined',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'username',
            'date_joined',
            'updated_at'
        ]


class UserSerializer(serializers.ModelSerializer):
    """
    Comprehensive user serializer for detailed user information.
    Used for user management operations.
    """
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'phone_number',
            'avatar',
            'bio',
            'is_active',
            'is_staff',
            'date_joined',
            'updated_at',
            'password',
            'password_confirm'
        ]
        read_only_fields = [
            'id',
            'date_joined',
            'updated_at'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate password confirmation."""
        if 'password' in attrs and 'password_confirm' in attrs:
            if attrs['password'] != attrs['password_confirm']:
                raise serializers.ValidationError({
                    'password_confirm': 'Password confirmation does not match.'
                })
        return attrs
    
    def create(self, validated_data):
        """Create user with encrypted password."""
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        """Update user with optional password change."""
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer with better error messages.
    Provides specific feedback for different authentication failures.
    """
    
    username_field = User.USERNAME_FIELD
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Change field names to match frontend expectations
        if 'username' in self.fields:
            self.fields['email'] = self.fields.pop('username')
        else:
            # If username field doesn't exist, create email field
            self.fields['email'] = serializers.EmailField(write_only=True)
        # Ensure password field exists
        if 'password' not in self.fields:
            self.fields['password'] = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validate credentials with specific error messages."""
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password', '')
        
        # Basic field validation
        if not email:
            raise serializers.ValidationError({
                'email': 'Email address is required.'
            })
        
        if not password:
            raise serializers.ValidationError({
                'password': 'Password is required.'
            })
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({
                'email': 'No account found with this email address.'
            })
        
        # Check if account is active
        if not user.is_active:
            raise serializers.ValidationError({
                'non_field_errors': 'This account has been disabled. Please contact support.'
            })
        
        # Attempt authentication
        user = authenticate(
            request=self.context.get('request'),
            username=email,  # Django uses username field for authentication
            password=password
        )
        
        if user is None:
            # User exists but password is wrong
            raise serializers.ValidationError({
                'password': 'Incorrect password. Please try again.'
            })
        
        # Authentication successful
        refresh = RefreshToken.for_user(user)
        
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data
        }


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        help_text="Password must be at least 8 characters long."
    )
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'first_name',
            'last_name',
            'password',
            'password_confirm',
            'phone_number'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_email(self, value):
        """Validate email uniqueness."""
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError(
                "An account with this email address already exists."
            )
        return value.lower()
    
    def validate_username(self, value):
        """Validate username uniqueness."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "An account with this username already exists."
            )
        return value
    
    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Password confirmation does not match.'
            })
        return attrs
    
    def create(self, validated_data):
        """Create new user account."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True)
    
    def validate_current_password(self, value):
        """Validate current password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value
    
    def validate(self, attrs):
        """Validate new password confirmation."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'New password confirmation does not match.'
            })
        return attrs
    
    def save(self, **kwargs):
        """Change user password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user