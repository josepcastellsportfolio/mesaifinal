"""
URL patterns for core app.
Additional endpoints not covered by the ViewSet router.
"""

from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Additional core-related endpoints can be added here
    # The main CRUD operations are handled by ViewSets in api_urls.py
]

