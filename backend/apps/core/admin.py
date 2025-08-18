"""
Django admin configuration for core models.
Provides comprehensive admin interfaces with custom actions and filters.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Avg
from .models import Category, Product, Tag, Review


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin configuration for Category model."""
    
    list_display = [
        'name',
        'parent',
        'full_path',
        'product_count',
        'is_active',
        'sort_order',
        'created_at',
    ]
    list_filter = ['is_active', 'parent', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['sort_order', 'name']
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description', 'parent')
        }),
        ('Display', {
            'fields': ('image', 'is_active', 'sort_order')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        """Add product count annotation."""
        queryset = super().get_queryset(request)
        return queryset.annotate(product_count=Count('products'))
    
    def product_count(self, obj):
        """Display product count."""
        return obj.product_count
    product_count.short_description = "Products"
    product_count.admin_order_field = 'product_count'


class TagInline(admin.TabularInline):
    """Inline admin for product tags."""
    model = Product.tags.through
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin configuration for Product model."""
    
    inlines = [TagInline]
    
    list_display = [
        'name',
        'category',
        'price',
        'stock_quantity',
        'status',
        'is_featured',
        'average_rating',
        'review_count',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'is_featured',
        'category',
        'created_at',
        'tags',
    ]
    
    search_fields = [
        'name',
        'description',
        'sku',
        'barcode',
    ]
    
    ordering = ['-created_at']
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description', 'short_description')
        }),
        ('Categorization', {
            'fields': ('category', 'status', 'is_featured')
        }),
        ('Pricing & Inventory', {
            'fields': ('price', 'cost', 'stock_quantity', 'sku', 'barcode')
        }),
        ('Physical Properties', {
            'fields': ('weight', 'dimensions'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    
    def get_queryset(self, request):
        """Add review statistics annotations."""
        queryset = super().get_queryset(request)
        return queryset.annotate(
            avg_rating=Avg('reviews__rating'),
            review_count=Count('reviews')
        ).select_related('category', 'created_by')
    
    def save_model(self, request, obj, form, change):
        """Set created_by when creating a new product."""
        if not change:  # Creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
    
    def average_rating(self, obj):
        """Display average rating."""
        if hasattr(obj, 'avg_rating') and obj.avg_rating:
            return f"{obj.avg_rating:.1f} ⭐"
        return "No ratings"
    average_rating.short_description = "Avg Rating"
    average_rating.admin_order_field = 'avg_rating'
    
    def review_count(self, obj):
        """Display review count."""
        return getattr(obj, 'review_count', 0)
    review_count.short_description = "Reviews"
    review_count.admin_order_field = 'review_count'
    
    # Custom admin actions
    def make_featured(self, request, queryset):
        """Mark selected products as featured."""
        queryset.update(is_featured=True)
        self.message_user(request, f"{queryset.count()} products marked as featured.")
    make_featured.short_description = "Mark as featured"
    
    def remove_featured(self, request, queryset):
        """Remove featured status from selected products."""
        queryset.update(is_featured=False)
        self.message_user(request, f"{queryset.count()} products removed from featured.")
    remove_featured.short_description = "Remove featured status"
    
    def publish_products(self, request, queryset):
        """Publish selected products."""
        queryset.update(status='published')
        self.message_user(request, f"{queryset.count()} products published.")
    publish_products.short_description = "Publish products"
    
    actions = ['make_featured', 'remove_featured', 'publish_products']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """Admin configuration for Tag model."""
    
    list_display = ['name', 'color_preview', 'product_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']
    ordering = ['name']
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'color', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        """Add product count annotation."""
        queryset = super().get_queryset(request)
        return queryset.annotate(product_count=Count('products'))
    
    def color_preview(self, obj):
        """Display color preview."""
        return format_html(
            '<span style="background-color: {}; padding: 2px 8px; color: white; border-radius: 3px;">{}</span>',
            obj.color,
            obj.color
        )
    color_preview.short_description = "Color"
    
    def product_count(self, obj):
        """Display product count."""
        return obj.product_count
    product_count.short_description = "Products"
    product_count.admin_order_field = 'product_count'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Admin configuration for Review model."""
    
    list_display = [
        'product',
        'user',
        'rating',
        'title',
        'is_approved',
        'is_verified_purchase',
        'helpful_votes',
        'created_at',
    ]
    
    list_filter = [
        'rating',
        'is_approved',
        'is_verified_purchase',
        'created_at',
    ]
    
    search_fields = [
        'title',
        'content',
        'user__username',
        'user__email',
        'product__name',
    ]
    
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('product', 'user', 'rating', 'title', 'content')
        }),
        ('Status', {
            'fields': ('is_approved', 'is_verified_purchase', 'helpful_votes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'helpful_votes']
    
    # Custom admin actions
    def approve_reviews(self, request, queryset):
        """Approve selected reviews."""
        queryset.update(is_approved=True)
        self.message_user(request, f"{queryset.count()} reviews approved.")
    approve_reviews.short_description = "Approve selected reviews"
    
    def reject_reviews(self, request, queryset):
        """Reject selected reviews."""
        queryset.update(is_approved=False)
        self.message_user(request, f"{queryset.count()} reviews rejected.")
    reject_reviews.short_description = "Reject selected reviews"
    
    actions = ['approve_reviews', 'reject_reviews']

