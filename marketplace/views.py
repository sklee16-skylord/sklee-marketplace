from django.shortcuts import render
from .models import Product  # Import your Product model

# Keep your existing home view
def home(request):
    return render(request, 'home.html')

# Add new marketplace view
def marketplace(request):
    products = Product.objects.filter(is_sold=False).order_by('-created_at')
    return render(request, 'marketplace.html', {'products': products})