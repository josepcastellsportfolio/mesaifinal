"""
Serializers for core models.
Implements comprehensive serialization with nested relationships and validation.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Category, Product, Tag, Review

User = get_user_model()


class TagSerializer(serializers.ModelSerializer):
    """
    Serializer for Tag model.
    Simple serializer for tag information.
    """
    product_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Tag
        fields = [
            'id',
            'name',
            'slug',
            'color',
            'is_active',
            'product_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category model.
    Includes hierarchical relationship handling and nested children.
    """
    
    children = serializers.SerializerMethodField()
    full_path = serializers.ReadOnlyField()
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'parent',
            'children',
            'full_path',
            'image',
            'is_active',
            'sort_order',
            'product_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_children(self, obj):
        """Get child categories recursively."""
        if obj.children.exists():
            return CategorySerializer(
                obj.children.filter(is_active=True),
                many=True,
                context=self.context
            ).data
        return []
    
    def get_product_count(self, obj):
        """Get the number of active products in this category."""
        return obj.products.filter(status='published').count()


class CategoryListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for category list views.
    Excludes nested relationships for better performance.
    """
    
    full_path = serializers.ReadOnlyField()
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'parent',
            'full_path',
            'image',
            'is_active',
            'sort_order',
            'product_count',
        ]
    
    def get_product_count(self, obj):
        """Get the number of active products in this category."""
        return obj.products.filter(status='published').count()


class ProductListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for product list views.
    Optimized for performance with minimal related data.
    """
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'short_description',
            'category_name',
            'price',
            'stock_quantity',
            'sku',
            'status',
            'is_featured',
            'is_in_stock',
            'created_by_name',
            'average_rating',
            'review_count',
            'created_at',
        ]
    
    def get_average_rating(self, obj):
        """Calculate average rating for the product."""
        reviews = obj.reviews.filter(is_approved=True)
        if reviews.exists():
            return round(sum(review.rating for review in reviews) / reviews.count(), 1)
        return None
    
    def get_review_count(self, obj):
        """Get the number of approved reviews."""
        return obj.reviews.filter(is_approved=True).count()


class ProductSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for Product model.
    Includes all relationships and computed fields.
    """
    
    category = CategoryListSerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    created_by = serializers.StringRelatedField(read_only=True)
    is_in_stock = serializers.ReadOnlyField()
    profit_margin = serializers.ReadOnlyField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    recent_reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'short_description',
            'category',
            'category_id',
            'price',
            'cost',
            'stock_quantity',
            'sku',
            'barcode',
            'weight',
            'dimensions',
            'status',
            'is_featured',
            'is_in_stock',
            'profit_margin',
            'created_by',
            'tags',
            'tag_ids',
            'average_rating',
            'review_count',
            'recent_reviews',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_by', 'created_at', 'updated_at']
    
    def validate_sku(self, value):
        """Validate SKU uniqueness."""
        instance = getattr(self, 'instance', None)
        if Product.objects.filter(sku=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("A product with this SKU already exists.")
        return value
    
    def validate_price(self, value):
        """Validate price is positive."""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
    
    def validate(self, attrs):
        """Cross-field validation."""
        cost = attrs.get('cost', getattr(self.instance, 'cost', None) if self.instance else None)
        price = attrs.get('price', getattr(self.instance, 'price', None) if self.instance else None)
        
        if cost and price and cost >= price:
            raise serializers.ValidationError({
                'cost': 'Cost must be less than price.'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create product with tags and set created_by."""
        tag_ids = validated_data.pop('tag_ids', [])
        validated_data['created_by'] = self.context['request'].user
        
        product = Product.objects.create(**validated_data)
        
        if tag_ids:
            product.tags.set(tag_ids)
        
        return product
    
    def update(self, instance, validated_data):
        """Update product with tags."""
        tag_ids = validated_data.pop('tag_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if tag_ids is not None:
            instance.tags.set(tag_ids)
        
        return instance
    
    def get_average_rating(self, obj):
        """Calculate average rating for the product."""
        reviews = obj.reviews.filter(is_approved=True)
        if reviews.exists():
            return round(sum(review.rating for review in reviews) / reviews.count(), 1)
        return None
    
    def get_review_count(self, obj):
        """Get the number of approved reviews."""
        return obj.reviews.filter(is_approved=True).count()
    
    def get_recent_reviews(self, obj):
        """Get the 3 most recent approved reviews."""
        recent_reviews = obj.reviews.filter(is_approved=True).order_by('-created_at')[:3]
        return ReviewListSerializer(recent_reviews, many=True).data


class ReviewSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for Review model.
    Includes user information and validation.
    """
    
    user = serializers.StringRelatedField(read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    star_display = serializers.ReadOnlyField()
    
    class Meta:
        model = Review
        fields = [
            'id',
            'product',
            'product_name',
            'user',
            'user_name',
            'rating',
            'title',
            'content',
            'is_verified_purchase',
            'is_approved',
            'helpful_votes',
            'star_display',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'is_verified_purchase',
            'helpful_votes',
            'created_at',
            'updated_at'
        ]
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5."""
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
    
    def create(self, validated_data):
        """Create review with current user."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ReviewListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for review list views.
    Optimized for performance in product detail views.
    """
    
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    star_display = serializers.ReadOnlyField()
    
    class Meta:
        model = Review
        fields = [
            'id',
            'user_name',
            'rating',
            'title',
            'content',
            'is_verified_purchase',
            'helpful_votes',
            'star_display',
            'created_at',
        ]

