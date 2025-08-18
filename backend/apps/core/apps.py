"""
Configuration for the core app.
Defines app-specific settings and signal connections.
"""

from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'
    verbose_name = 'Core Application'
    
    def ready(self):
        """
        Import signal handlers when the app is ready.
        This ensures signals are connected when Django starts.
        """
        import apps.core.signals

