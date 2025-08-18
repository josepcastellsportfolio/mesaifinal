"""
Core models for the application.
Contains example models with relationships to demonstrate Django ORM capabilities.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify

User = get_user_model()


class TimeStampedModel(models.Model):
    """
    Abstract base model that provides self-updating created_at and updated_at fields.
    All other models should inherit from this for consistent timestamp tracking.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class Category(TimeStampedModel):
    """
    Category model for organizing products or content.
    Demonstrates hierarchical relationships with self-referencing foreign key.
    """
    
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Category name"
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,
        blank=True,
        help_text="URL-friendly version of the name"
    )
    description = models.TextField(
        blank=True,
        help_text="Category description"
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        help_text="Parent category for hierarchical organization"
    )
    image = models.ImageField(
        upload_to='categories/',
        null=True,
        blank=True,
        help_text="Category image"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this category is active"
    )
    sort_order = models.PositiveIntegerField(
        default=0,
        help_text="Sort order for category display"
    )
    
    class Meta:
        db_table = 'categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Override save to auto-generate slug if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    @property
    def full_path(self):
        """Return the full hierarchical path of the category."""
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name
    
    def get_descendants(self):
        """Get all descendant categories recursively."""
        descendants = []
        for child in self.children.all():
            descendants.append(child)
            descendants.extend(child.get_descendants())
        return descendants


class Product(TimeStampedModel):
    """
    Product model demonstrating various field types and relationships.
    Shows many-to-one, many-to-many relationships and custom validators.
    """
    
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        ARCHIVED = 'archived', 'Archived'
    
    name = models.CharField(
        max_length=200,
        help_text="Product name"
    )
    slug = models.SlugField(
        max_length=200,
        unique=True,
        blank=True,
        help_text="URL-friendly version of the name"
    )
    description = models.TextField(
        help_text="Detailed product description"
    )
    short_description = models.CharField(
        max_length=500,
        blank=True,
        help_text="Brief product summary"
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products',
        help_text="Product category"
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Product price"
    )
    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True,
        help_text="Product cost (for margin calculation)"
    )
    stock_quantity = models.PositiveIntegerField(
        default=0,
        help_text="Available stock quantity"
    )
    sku = models.CharField(
        max_length=50,
        unique=True,
        help_text="Stock Keeping Unit"
    )
    barcode = models.CharField(
        max_length=50,
        blank=True,
        help_text="Product barcode"
    )
    weight = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Product weight in kg"
    )
    dimensions = models.CharField(
        max_length=100,
        blank=True,
        help_text="Product dimensions (L x W x H)"
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        help_text="Product status"
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Whether this product is featured"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_products',
        help_text="User who created this product"
    )
    tags = models.ManyToManyField(
        'Tag',
        blank=True,
        related_name='products',
        help_text="Product tags for categorization"
    )
    
    class Meta:
        db_table = 'products'
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'is_featured']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['sku']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Override save to auto-generate slug if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    @property
    def is_in_stock(self):
        """Check if product is in stock."""
        return self.stock_quantity > 0
    
    @property
    def profit_margin(self):
        """Calculate profit margin if cost is provided."""
        if self.cost:
            return ((self.price - self.cost) / self.price) * 100
        return None
    
    def reduce_stock(self, quantity):
        """Reduce stock quantity by specified amount."""
        if self.stock_quantity >= quantity:
            self.stock_quantity -= quantity
            self.save(update_fields=['stock_quantity'])
            return True
        return False


class Tag(TimeStampedModel):
    """
    Tag model for flexible product categorization.
    Demonstrates many-to-many relationships and simple metadata.
    """
    
    name = models.CharField(
        max_length=50,
        unique=True,
        help_text="Tag name"
    )
    slug = models.SlugField(
        max_length=50,
        unique=True,
        blank=True,
        help_text="URL-friendly version of the name"
    )
    color = models.CharField(
        max_length=7,
        default='#007bff',
        help_text="Hex color code for tag display"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this tag is active"
    )
    
    class Meta:
        db_table = 'tags'
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Override save to auto-generate slug if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    @property
    def product_count(self):
        """Get the number of products using this tag."""
        return self.products.count()


class Review(TimeStampedModel):
    """
    Review model for product reviews.
    Demonstrates user-generated content with ratings and moderation.
    """
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews',
        help_text="Product being reviewed"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews',
        help_text="User who wrote the review"
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    title = models.CharField(
        max_length=200,
        help_text="Review title"
    )
    content = models.TextField(
        help_text="Review content"
    )
    is_verified_purchase = models.BooleanField(
        default=False,
        help_text="Whether this review is from a verified purchase"
    )
    is_approved = models.BooleanField(
        default=True,
        help_text="Whether this review is approved for display"
    )
    helpful_votes = models.PositiveIntegerField(
        default=0,
        help_text="Number of helpful votes"
    )
    
    class Meta:
        db_table = 'reviews'
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        ordering = ['-created_at']
        unique_together = ['product', 'user']  # One review per user per product
        indexes = [
            models.Index(fields=['product', 'is_approved']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"Review by {self.user.username} for {self.product.name}"
    
    @property
    def star_display(self):
        """Return star representation of rating."""
        return '★' * self.rating + '☆' * (5 - self.rating)

