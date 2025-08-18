"""
URL patterns for users app.
Defines additional endpoints not covered by the ViewSet router.
"""

from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Additional user-related endpoints can be added here
    # The main CRUD operations are handled by the ViewSet in api_urls.py
]

