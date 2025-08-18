"""
Signal handlers for user-related events.
Implements automatic profile creation and other user lifecycle events.
"""

from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.core.cache import cache
from .models import UserProfile

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal handler to automatically create a UserProfile when a User is created.
    This ensures every user has an associated profile for extended information.
    """
    if created:
        UserProfile.objects.get_or_create(user=instance)
        
        # Clear user-related cache entries
        cache_key = f"user_stats"
        cache.delete(cache_key)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Signal handler to save the UserProfile when the User is saved.
    Ensures profile information is always kept in sync.
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()


@receiver(pre_delete, sender=User)
def cleanup_user_data(sender, instance, **kwargs):
    """
    Signal handler to clean up user-related data before user deletion.
    Performs cleanup operations like clearing cache entries.
    """
    # Clear user-specific cache entries
    user_cache_keys = [
        f"user_profile_{instance.id}",
        f"user_permissions_{instance.id}",
        "user_stats",
    ]
    
    cache.delete_many(user_cache_keys)

