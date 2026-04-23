import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import sys
sys.path.append(os.getcwd())
django.setup()

from store.models import WishlistItem, User

users = User.objects.all()
for user in users:
    items = WishlistItem.objects.filter(user=user)
    if items.exists():
        print(f"User: {user.email}")
        for item in items:
            print(f"  - Product ID: {item.product_id}, Product Name: {item.product.name}")
