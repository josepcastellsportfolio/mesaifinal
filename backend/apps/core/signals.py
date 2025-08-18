"""
Signal handlers for core models.
Implements cache invalidation and business logic triggers.
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Product, Category, Review


@receiver(post_save, sender=Product)
def invalidate_product_cache(sender, instance, created, **kwargs):
    """
    Signal handler to invalidate cache when products are created or updated.
    Clears relevant cache entries to ensure fresh data.
    """
    # Clear category-related cache
    cache_keys = [
        f"category_products_{instance.category.id}",
        f"featured_products",
        f"product_stats",
    ]
    cache.delete_many(cache_keys)
    
    # Clear tag-related cache if tags are associated
    if instance.tags.exists():
        for tag in instance.tags.all():
            cache.delete(f"tag_products_{tag.id}")


@receiver(post_delete, sender=Product)
def cleanup_product_cache(sender, instance, **kwargs):
    """
    Signal handler to clean up cache when products are deleted.
    """
    cache_keys = [
        f"category_products_{instance.category.id}",
        f"featured_products",
        f"product_stats",
    ]
    cache.delete_many(cache_keys)


@receiver(post_save, sender=Category)
def invalidate_category_cache(sender, instance, created, **kwargs):
    """
    Signal handler to invalidate cache when categories are created or updated.
    """
    cache_keys = [
        "category_tree",
        "root_categories",
        f"category_{instance.id}",
    ]
    cache.delete_many(cache_keys)
    
    # If this is a child category, also clear parent cache
    if instance.parent:
        cache.delete(f"category_{instance.parent.id}")


@receiver(post_save, sender=Review)
def update_product_rating_cache(sender, instance, created, **kwargs):
    """
    Signal handler to update product rating cache when reviews are added/updated.
    Recalculates average rating and review count for the product.
    """
    product = instance.product
    
    # Clear product-specific cache
    cache_keys = [
        f"product_rating_{product.id}",
        f"product_reviews_{product.id}",
    ]
    cache.delete_many(cache_keys)
    
    # If this is a new approved review, we might want to trigger additional actions
    if created and instance.is_approved:
        # Could trigger notification to product owner, update search index, etc.
        pass


@receiver(post_delete, sender=Review)
def cleanup_review_cache(sender, instance, **kwargs):
    """
    Signal handler to clean up cache when reviews are deleted.
    """
    product = instance.product
    
    cache_keys = [
        f"product_rating_{product.id}",
        f"product_reviews_{product.id}",
    ]
    cache.delete_many(cache_keys)

