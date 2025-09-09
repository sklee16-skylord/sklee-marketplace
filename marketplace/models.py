from django.db import models
from django.conf import settings  # Use this instead of direct import


class Product(models.Model):
    CONDITION_CHOICES = [
        ('new', 'Brand New'),
        ('used', 'Fairly Used'),
        ('refurbished', 'Refurbished'),
    ]

    # Use settings.AUTH_USER_MODEL instead of direct import
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    category = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    image = models.ImageField(upload_to='products/')  # Changed from images to image
    is_sold = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title