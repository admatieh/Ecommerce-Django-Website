"""
store/management/commands/seed.py

Seeds the database with the mock data that was previously hardcoded
in src/data/mockData.ts — so the frontend gets real API data immediately.

Usage:
  python manage.py seed_data
  python manage.py seed_data --flush   (wipe existing store data first)
"""

import os
import django
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

CATEGORIES = [
    {"id": 1, "name": "Dresses", "slug": "dresses",
     "image": "https://images.unsplash.com/photo-1551489186-cf8726f514f8?auto=format&fit=crop&w=1200&q=80",
     "featured": True, "order": 1},
    {"id": 2, "name": "Trousers", "slug": "trousers",
     "image": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80",
     "featured": True, "order": 2},
    {"id": 3, "name": "Outerwear", "slug": "outerwear",
     "image": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80",
     "featured": True, "order": 3},
    {"id": 4, "name": "Tops", "slug": "tops",
     "image": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80",
     "featured": True, "order": 4},
    {"id": 5, "name": "Knitwear", "slug": "knitwear",
     "image": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=80",
     "featured": True, "order": 5},
    {"id": 6, "name": "Accessories", "slug": "accessories",
     "image": "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=1200&q=80",
     "featured": False, "order": 6},
]

PRODUCTS = [
    # Dresses
    {"name": "Silk Blend Midi Dress", "category_slug": "dresses",
     "description": "A fluid silhouette with a softly draped waist, crafted in a lustrous silk blend.",
     "price": "120.00", "discount_price": "99.00", "is_active": True, "is_featured": True,
     "images": ["https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg"],
     "sizes": ["S", "M", "L"], "colors": ["Black", "Olive"], "stock_per_variant": 5},
    {"name": "Ribbed Knit Maxi Dress", "category_slug": "dresses",
     "description": "Form-fitting and comfortable ribbed knit dress for every occasion.",
     "price": "85.00", "discount_price": None, "is_active": True, "is_featured": False,
     "images": ["https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=80"],
     "sizes": ["XS", "S", "M"], "colors": ["Beige", "Black"], "stock_per_variant": 10},
    {"name": "Linen Wrap Dress", "category_slug": "dresses",
     "description": "Breathable linen wrap dress perfect for summer days.",
     "price": "110.00", "discount_price": None, "is_active": True, "is_featured": False,
     "images": ["https://images.unsplash.com/photo-1572804013309-82a88b0e8c8b?auto=format&fit=crop&w=1000&q=80"],
     "sizes": ["S", "M", "L", "XL"], "colors": ["White", "Navy"], "stock_per_variant": 6},
    
    # Trousers
    {"name": "Tailored Wide-Leg Trousers", "category_slug": "trousers",
     "description": "High-rise and expertly tailored with a clean drape.",
     "price": "95.00", "discount_price": None, "is_active": True, "is_featured": True,
     "images": ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80"],
     "sizes": ["2", "4", "6", "8"], "colors": ["Beige", "Navy", "Black"], "stock_per_variant": 15},
    {"name": "Cropped Wool Trousers", "category_slug": "trousers",
     "description": "A versatile cropped length trouser in premium wool blend.",
     "price": "130.00", "discount_price": "105.00", "is_active": True, "is_featured": False,
     "images": ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80"],
     "sizes": ["2", "4", "6"], "colors": ["Grey", "Charcoal"], "stock_per_variant": 8},
    {"name": "Relaxed Chino", "category_slug": "trousers",
     "description": "Everyday relaxed fit chinos in durable cotton.",
     "price": "65.00", "discount_price": None, "is_active": True, "is_featured": False,
     "images": ["https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1000&q=80"],
     "sizes": ["0", "2", "4", "6", "8"], "colors": ["Khaki", "Olive"], "stock_per_variant": 20},

    # Outerwear
    {"name": "Minimalist Overcoat", "category_slug": "outerwear",
     "description": "A modern overcoat with a streamlined profile and premium construction.",
     "price": "210.00", "discount_price": None, "is_active": True, "is_featured": True,
     "images": ["https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg"],
     "sizes": ["S", "M", "L"], "colors": ["Camel", "Black"], "stock_per_variant": 4},
    {"name": "Classic Trench Coat", "category_slug": "outerwear",
     "description": "Water-resistant cotton blend classic trench.",
     "price": "185.00", "discount_price": "150.00", "is_active": True, "is_featured": False,
     "images": ["https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg"],
     "sizes": ["XS", "S", "M", "L"], "colors": ["Beige"], "stock_per_variant": 6},
    {"name": "Leather Biker Jacket", "category_slug": "outerwear",
     "description": "Genuine leather jacket with asymmetric zip and silver hardware.",
     "price": "350.00", "discount_price": None, "is_active": True, "is_featured": True,
     "images": ["https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg"],
     "sizes": ["S", "M", "L", "XL"], "colors": ["Black"], "stock_per_variant": 3},

    # Tops
    {"name": "Essentials Cotton Tee", "category_slug": "tops",
     "description": "A breathable cotton essential with a flattering, minimal fit.",
     "price": "45.00", "discount_price": None, "is_active": True, "is_featured": True,
     "images": ["https://images.pexels.com/photos/1007013/pexels-photo-1007013.jpeg"],
     "sizes": ["XS", "S", "M", "L", "XL"], "colors": ["White", "Black", "Grey"], "stock_per_variant": 30},
    {"name": "Silk Camisole", "category_slug": "tops",
     "description": "Delicate silk camisole perfect for layering.",
     "price": "75.00", "discount_price": None, "is_active": True, "is_featured": False,
     "images": ["https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg"],
     "sizes": ["XS", "S", "M"], "colors": ["Ivory", "Navy"], "stock_per_variant": 12},
    {"name": "Poplin Button-Down", "category_slug": "tops",
     "description": "Crisp cotton poplin shirt with a relaxed tailored fit.",
     "price": "85.00", "discount_price": None, "is_active": True, "is_featured": False,
     "images": ["https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&w=1000&q=80"],
     "sizes": ["S", "M", "L"], "colors": ["White", "Blue"], "stock_per_variant": 15},

    # Knitwear
    {"name": "Chunky Cable Knit Sweater", "category_slug": "knitwear",
     "description": "Cozy and warm oversized cable knit sweater.",
     "price": "110.00", "discount_price": "85.00", "is_active": True, "is_featured": True,
     "images": ["https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=1000&q=80"],
     "sizes": ["S", "M", "L"], "colors": ["Cream", "Charcoal"], "stock_per_variant": 8},
    {"name": "Merino Wool Turtleneck", "category_slug": "knitwear",
     "description": "Fine merino wool turtleneck for a sleek layered look.",
     "price": "95.00", "discount_price": None, "is_active": True, "is_featured": False,
     "images": ["https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&w=1000&q=80"],
     "sizes": ["XS", "S", "M", "L"], "colors": ["Black", "Burgundy"], "stock_per_variant": 10},

    # Accessories
    {"name": "Leather Crossbody Bag", "category_slug": "accessories",
     "description": "Minimalist leather bag with adjustable strap.",
     "price": "145.00", "discount_price": None, "is_active": True, "is_featured": True,
     "images": ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80"],
     "sizes": [], "colors": ["Tan", "Black"], "stock_per_variant": 5},
    {"name": "Gold Hoop Earrings", "category_slug": "accessories",
     "description": "Classic 14k gold plated mid-size hoops.",
     "price": "45.00", "discount_price": None, "is_active": True, "is_featured": False,
     "images": ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80"],
     "sizes": [], "colors": ["Gold"], "stock_per_variant": 20},
]

DISCOUNTS = [
    {"name": "Studio Welcome Offer", "discount_type": "percentage", "value": "10",
     "code": "", "min_order_amount": "150"},
    {"name": "VIP 50", "discount_type": "fixed", "value": "50",
     "code": "VIP50", "min_order_amount": "250"},
    {"name": "Runway 15%", "discount_type": "percentage", "value": "15",
     "code": "RUNWAY15", "min_order_amount": "180"},
]

SHIPPING_RULES = [
    {"label": "Standard Shipping", "min_order_amount": "0", "cost": "12"},
    {"label": "Free Shipping", "min_order_amount": "150", "cost": "0"},
]


class Command(BaseCommand):
    help = "Seeds the database with mock catalogue data, users, and orders"

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete all existing store data before seeding",
        )

    def handle(self, *args, **options):
        from store.models import (
            User, Category, Discount, Product, ProductImage, ProductVariant, ShippingRule, Order, OrderItem
        )

        if options["flush"]:
            self.stdout.write("Flushing existing store data…")
            Order.objects.all().delete()
            ProductVariant.objects.all().delete()
            ProductImage.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            Discount.objects.all().delete()
            ShippingRule.objects.all().delete()
            User.objects.filter(email__in=['user@test.com', 'admin']).delete()

        # --- Users ---
        self.stdout.write("Seeding users...")
        # 1. Admin User
        admin_user, admin_created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@velora.com',
                'is_staff': True,
                'is_superuser': True,
                'is_email_verified': True
            }
        )
        if admin_created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write("  Created admin user (admin / admin123)")

        # 2. Verified Normal User
        normal_user, normal_created = User.objects.get_or_create(
            email='user@test.com',
            defaults={
                'username': 'user@test.com',
                'first_name': 'Test',
                'last_name': 'User',
                'is_email_verified': True
            }
        )
        if normal_created:
            normal_user.set_password('user123')
            normal_user.save()
            self.stdout.write("  Created normal user (user@test.com / user123)")

        # --- Categories ---
        self.stdout.write("Seeding categories...")
        cat_map: dict[str, Category] = {}
        for data in CATEGORIES:
            cat, created = Category.objects.update_or_create(
                slug=data["slug"],
                defaults={
                    "name": data["name"],
                    "image": data["image"],
                    "featured": data["featured"],
                    "order": data["order"],
                    "is_active": True,
                },
            )
            cat_map[data["slug"]] = cat

        # --- Products ---
        self.stdout.write("Seeding products...")
        all_products = []
        for data in PRODUCTS:
            cat = cat_map[data["category_slug"]]
            product, created = Product.objects.update_or_create(
                slug=__import__("django.utils.text", fromlist=["slugify"]).slugify(data["name"]),
                defaults={
                    "name": data["name"],
                    "description": data["description"],
                    "price": data["price"],
                    "discount_price": data["discount_price"],
                    "category": cat,
                    "is_active": data["is_active"],
                    "is_featured": data["is_featured"],
                },
            )
            all_products.append(product)
            # Images
            product.images.all().delete()
            for idx, url in enumerate(data["images"]):
                ProductImage.objects.create(product=product, image_url=url, order=idx)

            # Variants
            product.variants.all().delete()
            sizes = data["sizes"]
            colors = data["colors"]
            stock = data["stock_per_variant"]

            if sizes and colors:
                for size in sizes:
                    for color in colors:
                        ProductVariant.objects.create(
                            product=product, size=size, color=color, stock=stock
                        )
            elif sizes:
                for size in sizes:
                    ProductVariant.objects.create(product=product, size=size, color="", stock=stock)
            elif colors:
                for color in colors:
                    ProductVariant.objects.create(product=product, size="", color=color, stock=stock)
            else:
                # Single-SKU
                ProductVariant.objects.create(product=product, size="", color="", stock=stock)

        # --- Discounts ---
        self.stdout.write("Seeding discounts...")
        Discount.objects.all().delete()
        for data in DISCOUNTS:
            Discount.objects.create(
                name=data["name"],
                discount_type=data["discount_type"],
                value=data["value"],
                code=data["code"],
                min_order_amount=data["min_order_amount"],
                is_active=True,
            )

        # --- Shipping rules ---
        self.stdout.write("Seeding shipping rules...")
        ShippingRule.objects.all().delete()
        for data in SHIPPING_RULES:
            ShippingRule.objects.create(
                label=data["label"],
                min_order_amount=data["min_order_amount"],
                cost=data["cost"],
                is_active=True,
            )

        # --- Sample Orders ---
        self.stdout.write("Seeding orders...")
        if all_products and normal_user:
            # Delete old orders for user to keep it idempotent if flush wasn't used
            Order.objects.filter(user=normal_user).delete()
            
            p1 = all_products[0]
            v1 = p1.variants.first()
            
            order = Order.objects.create(
                user=normal_user,
                full_name="Test User",
                email="user@test.com",
                phone="555-0123",
                address="123 Example St",
                city="New York",
                country="US",
                payment_method="credit_card",
                subtotal=p1.discount_price or p1.price,
                discount=0,
                shipping=12,
                total=float(p1.discount_price or p1.price) + 12,
                status="processing",
                estimated_delivery=timezone.now() + timedelta(days=5),
            )
            
            OrderItem.objects.create(
                order=order,
                product=p1,
                product_name=p1.name,
                price=p1.discount_price or p1.price,
                image=p1.images.first().image_url if p1.images.exists() else '',
                size=v1.size if v1 else '',
                color=v1.color if v1 else '',
                quantity=1,
            )
            self.stdout.write("  Created sample order for user@test.com")

        self.stdout.write(self.style.SUCCESS("[OK] Seeding complete!"))

