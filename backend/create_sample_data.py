#!/usr/bin/env python
"""
Script to create sample data for testing the statistics endpoint.
Run this script to populate the database with sample categories and products.
"""

import os
import sys
import django
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from apps.core.models import Category, Product, Tag
from apps.users.models import User

def create_sample_data():
    """Create sample categories, tags, and products."""
    
    print("Creating sample data...")
    
    # Get or create admin user for products
    admin_user, created = User.objects.get_or_create(
        email='admin@example.com',
        defaults={
            'username': 'admin',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"Created admin user: {admin_user.email}")
    
    # Create categories
    categories_data = [
        {'name': 'Electronics', 'description': 'Electronic devices and gadgets'},
        {'name': 'Computers', 'description': 'Laptops, desktops, and computer accessories', 'parent_name': 'Electronics'},
        {'name': 'Smartphones', 'description': 'Mobile phones and accessories', 'parent_name': 'Electronics'},
        {'name': 'Clothing', 'description': 'Apparel and fashion items'},
        {'name': 'Books', 'description': 'Books and educational materials'},
        {'name': 'Home & Garden', 'description': 'Home improvement and garden items'},
    ]
    
    categories = {}
    for cat_data in categories_data:
        parent = None
        if 'parent_name' in cat_data:
            parent = categories.get(cat_data['parent_name'])
        
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'description': cat_data['description'],
                'parent': parent,
                'is_active': True,
                'sort_order': len(categories)
            }
        )
        categories[cat_data['name']] = category
        if created:
            print(f"Created category: {category.name}")
    
    # Create tags
    tags_data = [
        {'name': 'New', 'color': '#28a745'},
        {'name': 'Sale', 'color': '#dc3545'},
        {'name': 'Popular', 'color': '#007bff'},
        {'name': 'Limited Edition', 'color': '#ffc107'},
        {'name': 'Eco-Friendly', 'color': '#20c997'},
    ]
    
    tags = {}
    for tag_data in tags_data:
        tag, created = Tag.objects.get_or_create(
            name=tag_data['name'],
            defaults={
                'color': tag_data['color'],
                'is_active': True
            }
        )
        tags[tag_data['name']] = tag
        if created:
            print(f"Created tag: {tag.name}")
    
    # Create products
    products_data = [
        {
            'name': 'Gaming Laptop Pro',
            'description': 'High-performance gaming laptop with RTX graphics',
            'short_description': 'Professional gaming laptop',
            'category': 'Computers',
            'price': Decimal('1299.99'),
            'cost_price': Decimal('999.99'),
            'stock_quantity': 15,
            'sku': 'LAPTOP-001',
            'status': 'published',
            'is_featured': True,
            'tags': ['New', 'Popular']
        },
        {
            'name': 'Wireless Headphones',
            'description': 'Premium noise-canceling wireless headphones',
            'short_description': 'Noise-canceling headphones',
            'category': 'Electronics',
            'price': Decimal('199.99'),
            'cost_price': Decimal('149.99'),
            'stock_quantity': 25,
            'sku': 'HEAD-001',
            'status': 'published',
            'is_featured': True,
            'tags': ['Popular', 'Sale']
        },
        {
            'name': 'Smartphone X Pro',
            'description': 'Latest flagship smartphone with advanced camera',
            'short_description': 'Flagship smartphone',
            'category': 'Smartphones',
            'price': Decimal('899.99'),
            'cost_price': Decimal('699.99'),
            'stock_quantity': 8,  # Low stock
            'sku': 'PHONE-001',
            'status': 'published',
            'is_featured': False,
            'tags': ['New']
        },
        {
            'name': 'Cotton T-Shirt',
            'description': 'Comfortable 100% cotton t-shirt',
            'short_description': 'Cotton t-shirt',
            'category': 'Clothing',
            'price': Decimal('29.99'),
            'cost_price': Decimal('19.99'),
            'stock_quantity': 50,
            'sku': 'SHIRT-001',
            'status': 'published',
            'is_featured': False,
            'tags': ['Eco-Friendly']
        },
        {
            'name': 'Programming Book',
            'description': 'Comprehensive guide to modern programming',
            'short_description': 'Programming guide',
            'category': 'Books',
            'price': Decimal('49.99'),
            'cost_price': Decimal('29.99'),
            'stock_quantity': 20,
            'sku': 'BOOK-001',
            'status': 'published',
            'is_featured': False,
            'tags': ['Popular']
        },
        {
            'name': 'Garden Tool Set',
            'description': 'Complete set of gardening tools',
            'short_description': 'Gardening tools',
            'category': 'Home & Garden',
            'price': Decimal('79.99'),
            'cost_price': Decimal('59.99'),
            'stock_quantity': 3,  # Low stock
            'sku': 'GARDEN-001',
            'status': 'draft',  # Draft status
            'is_featured': False,
            'tags': ['Limited Edition']
        },
        {
            'name': 'Vintage Watch',
            'description': 'Classic vintage-style wristwatch',
            'short_description': 'Vintage watch',
            'category': 'Electronics',
            'price': Decimal('299.99'),
            'cost_price': Decimal('199.99'),
            'stock_quantity': 0,  # Out of stock
            'sku': 'WATCH-001',
            'status': 'archived',  # Archived status
            'is_featured': False,
            'tags': ['Limited Edition']
        }
    ]
    
    for product_data in products_data:
        # Get category
        category = categories.get(product_data['category'])
        if not category:
            print(f"Warning: Category '{product_data['category']}' not found for product '{product_data['name']}'")
            continue
        
        # Create product
        product, created = Product.objects.get_or_create(
            sku=product_data['sku'],
            defaults={
                'name': product_data['name'],
                'description': product_data['description'],
                'short_description': product_data['short_description'],
                'category': category,
                'price': product_data['price'],
                'cost_price': product_data['cost_price'],
                'stock_quantity': product_data['stock_quantity'],
                'status': product_data['status'],
                'is_featured': product_data['is_featured'],
                'created_by': admin_user
            }
        )
        
        if created:
            # Add tags
            for tag_name in product_data['tags']:
                tag = tags.get(tag_name)
                if tag:
                    product.tags.add(tag)
            
            print(f"Created product: {product.name} (Status: {product.status}, Stock: {product.stock_quantity})")
    
    # Print summary
    print("\n=== SAMPLE DATA CREATED ===")
    print(f"Categories: {Category.objects.count()}")
    print(f"Tags: {Tag.objects.count()}")
    print(f"Products: {Product.objects.count()}")
    print(f"- Published: {Product.objects.filter(status='published').count()}")
    print(f"- Draft: {Product.objects.filter(status='draft').count()}")
    print(f"- Archived: {Product.objects.filter(status='archived').count()}")
    print(f"- Featured: {Product.objects.filter(is_featured=True).count()}")
    print(f"- Low stock (≤10): {Product.objects.filter(stock_quantity__lte=10).count()}")
    print(f"- Out of stock: {Product.objects.filter(stock_quantity=0).count()}")
    print("\nYou can now test the statistics endpoint!")

if __name__ == '__main__':
    create_sample_data()

