"""
Tests for core app.
Includes unit tests for models, serializers, and API endpoints.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from decimal import Decimal

from apps.core.models import Category, Product, Tag, Review

User = get_user_model()


class CategoryModelTest(TestCase):
    """Test cases for Category model."""
    
    def setUp(self):
        """Set up test data."""
        self.parent_category = Category.objects.create(
            name='Electronics',
            description='Electronic devices'
        )
        
        self.child_category = Category.objects.create(
            name='Smartphones',
            description='Mobile phones',
            parent=self.parent_category
        )
    
    def test_category_str_representation(self):
        """Test category string representation."""
        self.assertEqual(str(self.parent_category), 'Electronics')
    
    def test_category_slug_auto_generation(self):
        """Test automatic slug generation."""
        category = Category.objects.create(name='Test Category')
        self.assertEqual(category.slug, 'test-category')
    
    def test_category_full_path(self):
        """Test category full path property."""
        self.assertEqual(self.parent_category.full_path, 'Electronics')
        self.assertEqual(self.child_category.full_path, 'Electronics > Smartphones')
    
    def test_category_descendants(self):
        """Test getting category descendants."""
        grandchild = Category.objects.create(
            name='iPhone',
            parent=self.child_category
        )
        
        descendants = self.parent_category.get_descendants()
        self.assertIn(self.child_category, descendants)
        self.assertIn(grandchild, descendants)


class ProductModelTest(TestCase):
    """Test cases for Product model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.category = Category.objects.create(
            name='Electronics',
            description='Electronic devices'
        )
        
        self.product = Product.objects.create(
            name='Test Product',
            description='A test product',
            category=self.category,
            price=Decimal('99.99'),
            cost=Decimal('50.00'),
            stock_quantity=10,
            sku='TEST-001',
            created_by=self.user
        )
    
    def test_product_str_representation(self):
        """Test product string representation."""
        self.assertEqual(str(self.product), 'Test Product')
    
    def test_product_slug_auto_generation(self):
        """Test automatic slug generation."""
        self.assertEqual(self.product.slug, 'test-product')
    
    def test_product_is_in_stock(self):
        """Test is_in_stock property."""
        self.assertTrue(self.product.is_in_stock)
        
        self.product.stock_quantity = 0
        self.assertFalse(self.product.is_in_stock)
    
    def test_product_profit_margin(self):
        """Test profit margin calculation."""
        expected_margin = ((Decimal('99.99') - Decimal('50.00')) / Decimal('99.99')) * 100
        self.assertAlmostEqual(float(self.product.profit_margin), float(expected_margin), places=2)
    
    def test_product_reduce_stock(self):
        """Test stock reduction method."""
        initial_stock = self.product.stock_quantity
        
        # Successful reduction
        success = self.product.reduce_stock(5)
        self.assertTrue(success)
        self.assertEqual(self.product.stock_quantity, initial_stock - 5)
        
        # Failed reduction (insufficient stock)
        success = self.product.reduce_stock(10)
        self.assertFalse(success)
        self.assertEqual(self.product.stock_quantity, initial_stock - 5)  # Unchanged


class ReviewModelTest(TestCase):
    """Test cases for Review model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.category = Category.objects.create(name='Electronics')
        
        self.product = Product.objects.create(
            name='Test Product',
            description='A test product',
            category=self.category,
            price=Decimal('99.99'),
            stock_quantity=10,
            sku='TEST-001',
            created_by=self.user
        )
        
        self.review = Review.objects.create(
            product=self.product,
            user=self.user,
            rating=5,
            title='Great product!',
            content='I love this product.'
        )
    
    def test_review_str_representation(self):
        """Test review string representation."""
        expected_str = f"Review by {self.user.username} for {self.product.name}"
        self.assertEqual(str(self.review), expected_str)
    
    def test_review_star_display(self):
        """Test star display property."""
        self.assertEqual(self.review.star_display, '★★★★★')
        
        # Test with different rating
        self.review.rating = 3
        self.assertEqual(self.review.star_display, '★★★☆☆')
    
    def test_review_unique_constraint(self):
        """Test unique constraint (one review per user per product)."""
        with self.assertRaises(Exception):
            Review.objects.create(
                product=self.product,
                user=self.user,
                rating=4,
                title='Another review',
                content='This should fail.'
            )


class ProductAPITest(APITestCase):
    """Test cases for Product API endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            role=User.Role.ADMIN,
            is_staff=True
        )
        
        self.category = Category.objects.create(
            name='Electronics',
            description='Electronic devices'
        )
        
        self.tag = Tag.objects.create(name='Popular')
        
        self.product = Product.objects.create(
            name='Test Product',
            description='A test product',
            category=self.category,
            price=Decimal('99.99'),
            stock_quantity=10,
            sku='TEST-001',
            status='published',
            created_by=self.user
        )
        self.product.tags.add(self.tag)
    
    def get_jwt_token(self, user):
        """Helper method to get JWT token for user."""
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)
    
    def test_product_list_public(self):
        """Test product list is accessible to authenticated users."""
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = reverse('core:product-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_product_detail(self):
        """Test product detail endpoint."""
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = reverse('core:product-detail', kwargs={'slug': self.product.slug})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.product.name)
        self.assertEqual(response.data['sku'], self.product.sku)
    
    def test_product_create_permission(self):
        """Test product creation requires admin/manager permission."""
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        product_data = {
            'name': 'New Product',
            'description': 'A new product',
            'category_id': self.category.id,
            'price': '149.99',
            'stock_quantity': 5,
            'sku': 'NEW-001'
        }
        
        url = reverse('core:product-list')
        response = self.client.post(url, product_data, format='json')
        
        # Regular user should not be able to create products
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_product_create_admin(self):
        """Test product creation by admin user."""
        token = self.get_jwt_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        product_data = {
            'name': 'Admin Product',
            'description': 'A product created by admin',
            'category_id': self.category.id,
            'price': '199.99',
            'stock_quantity': 15,
            'sku': 'ADMIN-001',
            'tag_ids': [self.tag.id]
        }
        
        url = reverse('core:product-list')
        response = self.client.post(url, product_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Admin Product')
        self.assertEqual(response.data['created_by'], str(self.admin_user))
    
    def test_product_search(self):
        """Test product search functionality."""
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = reverse('core:product-list')
        response = self.client.get(url, {'search': 'Test'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Test Product')
    
    def test_product_filter_by_category(self):
        """Test product filtering by category."""
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = reverse('core:product-list')
        response = self.client.get(url, {'category': self.category.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_add_review(self):
        """Test adding a review to a product."""
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        review_data = {
            'rating': 5,
            'title': 'Excellent product!',
            'content': 'I highly recommend this product.'
        }
        
        url = reverse('core:product-add-review', kwargs={'slug': self.product.slug})
        response = self.client.post(url, review_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['rating'], 5)
        self.assertEqual(response.data['title'], 'Excellent product!')
    
    def test_add_duplicate_review(self):
        """Test that users cannot add multiple reviews for the same product."""
        # Create initial review
        Review.objects.create(
            product=self.product,
            user=self.user,
            rating=4,
            title='First review',
            content='My first review'
        )
        
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        review_data = {
            'rating': 5,
            'title': 'Second review',
            'content': 'Trying to add another review'
        }
        
        url = reverse('core:product-add-review', kwargs={'slug': self.product.slug})
        response = self.client.post(url, review_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_featured_products(self):
        """Test featured products endpoint."""
        # Mark product as featured
        self.product.is_featured = True
        self.product.save()
        
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = reverse('core:product-featured')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Test Product')

