"""
ViewSets for core models.
Implements comprehensive CRUD operations with filtering, searching, and caching.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.core.cache import cache
from django.db.models import Q, Avg, Count

from .models import Category, Product, Tag, Review
from .serializers import (
    CategorySerializer,
    CategoryListSerializer,
    ProductSerializer,
    ProductListSerializer,
    TagSerializer,
    ReviewSerializer,
    ReviewListSerializer,
)
from apps.users.permissions import IsAdminOrManagerOrReadOnly


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Category model with hierarchical support.
    Includes caching and custom actions for category management.
    """
    
    queryset = Category.objects.filter(is_active=True).prefetch_related('children')
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrManagerOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['parent', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'sort_order', 'created_at']
    ordering = ['sort_order', 'name']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        """Use simplified serializer for list view."""
        if self.action == 'list':
            return CategoryListSerializer
        return CategorySerializer
    
    def get_queryset(self):
        """Optimize queryset with prefetch_related for better performance."""
        queryset = super().get_queryset()
        
        if self.action == 'list':
            # For list view, include product count annotation
            queryset = queryset.annotate(
                product_count=Count('products', filter=Q(products__status='published'))
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def root_categories(self, request):
        """Get only root categories (categories without parent)."""
        root_categories = self.get_queryset().filter(parent=None)
        serializer = self.get_serializer(root_categories, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def products(self, request, slug=None):
        """Get all products in this category and its subcategories."""
        category = self.get_object()
        
        # Get all descendant categories
        descendant_categories = category.get_descendants()
        category_ids = [category.id] + [cat.id for cat in descendant_categories]
        
        # Get products from all categories
        products = Product.objects.filter(
            category_id__in=category_ids,
            status='published'
        ).select_related('category', 'created_by')
        
        # Apply pagination
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product model with comprehensive filtering and search.
    Includes inventory management and review aggregation.
    """
    
    queryset = Product.objects.select_related('category', 'created_by').prefetch_related('tags')
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrManagerOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'status', 'is_featured', 'tags']
    search_fields = ['name', 'description', 'sku']
    ordering_fields = ['name', 'price', 'created_at', 'stock_quantity']
    ordering = ['-created_at']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        """Use simplified serializer for list view."""
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer
    
    def get_queryset(self):
        """Filter queryset based on user permissions and add annotations."""
        queryset = super().get_queryset()
        
        # Non-staff users can only see published products
        if not self.request.user.is_staff:
            queryset = queryset.filter(status='published')
        
        # Add review statistics
        if self.action in ['list', 'retrieve']:
            queryset = queryset.annotate(
                avg_rating=Avg('reviews__rating', filter=Q(reviews__is_approved=True)),
                review_count=Count('reviews', filter=Q(reviews__is_approved=True))
            )
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_review(self, request, slug=None):
        """Add a review to the product."""
        product = self.get_object()
        
        # Check if user already reviewed this product
        if Review.objects.filter(product=product, user=request.user).exists():
            return Response(
                {'error': 'You have already reviewed this product.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ReviewSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, slug=None):
        """Get all reviews for the product."""
        product = self.get_object()
        reviews = product.reviews.filter(is_approved=True).order_by('-created_at')
        
        page = self.paginate_queryset(reviews)
        if page is not None:
            serializer = ReviewListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ReviewListSerializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def update_stock(self, request, slug=None):
        """Update product stock quantity."""
        product = self.get_object()
        quantity = request.data.get('quantity')
        operation = request.data.get('operation', 'set')  # 'set', 'add', 'subtract'
        
        if quantity is None:
            return Response(
                {'error': 'Quantity is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            quantity = int(quantity)
        except ValueError:
            return Response(
                {'error': 'Quantity must be a valid integer.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if operation == 'set':
            product.stock_quantity = max(0, quantity)
        elif operation == 'add':
            product.stock_quantity += quantity
        elif operation == 'subtract':
            product.stock_quantity = max(0, product.stock_quantity - quantity)
        else:
            return Response(
                {'error': 'Invalid operation. Use "set", "add", or "subtract".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product.save(update_fields=['stock_quantity'])
        
        return Response({
            'message': 'Stock updated successfully.',
            'new_stock_quantity': product.stock_quantity
        })
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products."""
        featured_products = self.get_queryset().filter(is_featured=True, status='published')
        
        page = self.paginate_queryset(featured_products)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get products with low stock (admin only)."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        threshold = request.query_params.get('threshold', 10)
        try:
            threshold = int(threshold)
        except ValueError:
            threshold = 10
        
        low_stock_products = self.get_queryset().filter(stock_quantity__lte=threshold)
        
        serializer = self.get_serializer(low_stock_products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get product statistics (admin/manager only)."""
        if not (request.user.is_staff or 
                (hasattr(request.user, 'is_admin') and request.user.is_admin()) or
                (hasattr(request.user, 'is_manager') and request.user.is_manager())):
            return Response(
                {'error': 'Permission denied.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get product statistics
        all_products = Product.objects.all()
        
        stats = {
            'total_products': all_products.count(),
            'published_products': all_products.filter(status='published').count(),
            'draft_products': all_products.filter(status='draft').count(),
            'archived_products': all_products.filter(status='archived').count(),
            'featured_products': all_products.filter(is_featured=True).count(),
            'low_stock_products': all_products.filter(stock_quantity__lte=10).count(),
            'out_of_stock_products': all_products.filter(stock_quantity=0).count(),
        }
        
        # Add category statistics
        from django.db.models import Count
        category_stats = Category.objects.annotate(
            product_count=Count('products')
        ).order_by('-product_count')[:5]
        
        stats['top_categories'] = [
            {
                'name': cat.name,
                'product_count': cat.product_count
            }
            for cat in category_stats
        ]
        
        # Add review statistics if reviews exist
        try:
            from django.db.models import Avg
            review_stats = Review.objects.aggregate(
                total_reviews=Count('id'),
                approved_reviews=Count('id', filter=Q(is_approved=True)),
                average_rating=Avg('rating', filter=Q(is_approved=True))
            )
            stats.update(review_stats)
            if stats['average_rating']:
                stats['average_rating'] = round(stats['average_rating'], 2)
        except:
            # In case Review model doesn't exist or has issues
            stats.update({
                'total_reviews': 0,
                'approved_reviews': 0,
                'average_rating': None
            })
        
        return Response(stats)


class TagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Tag model with product association.
    Simple CRUD operations with product counting.
    """
    
    queryset = Tag.objects.filter(is_active=True)
    serializer_class = TagSerializer
    permission_classes = [IsAdminOrManagerOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    lookup_field = 'slug'
    
    @action(detail=True, methods=['get'])
    def products(self, request, slug=None):
        """Get all products with this tag."""
        tag = self.get_object()
        products = tag.products.filter(status='published').select_related('category', 'created_by')
        
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Review model with moderation capabilities.
    Includes approval workflow and helpful vote tracking.
    """
    
    queryset = Review.objects.select_related('product', 'user')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['product', 'rating', 'is_approved', 'is_verified_purchase']
    search_fields = ['title', 'content']
    ordering_fields = ['rating', 'created_at', 'helpful_votes']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter reviews based on user permissions."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_staff:
            # Regular users can only see approved reviews and their own reviews
            queryset = queryset.filter(
                Q(is_approved=True) | Q(user=self.request.user)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        """Set the user when creating a review."""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """Approve a review (admin only)."""
        review = self.get_object()
        review.is_approved = True
        review.save(update_fields=['is_approved'])
        
        return Response({'message': 'Review approved successfully.'})
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        """Reject a review (admin only)."""
        review = self.get_object()
        review.is_approved = False
        review.save(update_fields=['is_approved'])
        
        return Response({'message': 'Review rejected successfully.'})
    
    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        """Mark a review as helpful."""
        review = self.get_object()
        review.helpful_votes += 1
        review.save(update_fields=['helpful_votes'])
        
        return Response({
            'message': 'Review marked as helpful.',
            'helpful_votes': review.helpful_votes
        })

