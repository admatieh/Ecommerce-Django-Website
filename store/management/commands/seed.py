"""
store/management/commands/seed.py

Seeds the database with the mock data that was previously hardcoded
in src/data/mockData.ts — so the frontend gets real API data immediately.

Usage:
  python manage.py seed
  python manage.py seed --flush   (wipe existing store data first)
"""

import os
import django
from django.core.management.base import BaseCommand

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
]

PRODUCTS = [
    {
        "id": 1, "name": "Silk Blend Midi Dress", "category_slug": "dresses",
        "description": "A fluid silhouette with a softly draped waist, crafted in a lustrous silk blend for elegant movement from day to evening.",
        "price": "120.00", "discount_price": "99.00",
        "is_active": True, "is_featured": True,
        "images": [
            "https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=1000",
            "https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=1000",
            "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=80",
        ],
        "sizes": ["XS", "S", "M", "L"],
        "colors": ["Black", "Champagne", "Olive"],
        "stock_per_variant": 3,
    },
    {
        "id": 5, "name": "Midi Dress", "category_slug": "dresses",
        "description": "Cut with structured seams and a refined neckline, this elevated midi dress offers polished styling for modern occasions.",
        "price": "220.00", "discount_price": None,
        "is_active": True, "is_featured": True,
        "images": [
            "https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=1000",
            "https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=1000",
            "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=80",
        ],
        "sizes": ["XS", "S", "M", "L"],
        "colors": ["Black", "Champagne", "Olive"],
        "stock_per_variant": 1,
    },
    {
        "id": 2, "name": "Tailored Wide-Leg Trousers", "category_slug": "trousers",
        "description": "High-rise and expertly tailored with a clean drape, these trousers balance comfort and precision for everyday sophistication.",
        "price": "95.00", "discount_price": None,
        "is_active": True, "is_featured": False,
        "images": [
            "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1000&q=80",
        ],
        "sizes": ["0", "2", "4", "6", "8", "10"],
        "colors": ["Beige", "Navy", "Black"],
        "stock_per_variant": 2,
    },
    {
        "id": 3, "name": "Minimalist Overcoat", "category_slug": "outerwear",
        "description": "A modern overcoat with a streamlined profile and premium construction, designed to layer effortlessly through changing seasons.",
        "price": "210.00", "discount_price": None,
        "is_active": True, "is_featured": False,
        "images": [
            "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=1000",
            "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1000",
            "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1000",
        ],
        "sizes": ["S", "M", "L"],
        "colors": [],
        "stock_per_variant": 4,
    },
    {
        "id": 4, "name": "Essentials Cotton Tee", "category_slug": "tops",
        "description": "A breathable cotton essential with a flattering, minimal fit that pairs naturally with tailoring, denim, and layered looks.",
        "price": "45.00", "discount_price": None,
        "is_active": True, "is_featured": True,
        "images": [
            "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1000",
            "https://images.pexels.com/photos/1007013/pexels-photo-1007013.jpeg?auto=compress&cs=tinysrgb&w=1000",
            "https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&w=1000",
        ],
        "sizes": ["XS", "S", "M", "L", "XL"],
        "colors": ["White", "Black", "Grey"],
        "stock_per_variant": 3,
    },
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
    help = "Seeds the database with mock catalogue data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete all existing store data before seeding",
        )

    def handle(self, *args, **options):
        from store.models import (
            Category, Discount, Product, ProductImage, ProductVariant, ShippingRule
        )

        if options["flush"]:
            self.stdout.write("Flushing existing store data…")
            ProductVariant.objects.all().delete()
            ProductImage.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            Discount.objects.all().delete()
            ShippingRule.objects.all().delete()

        # --- Categories ---
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
            status = "Created" if created else "Updated"
            self.stdout.write(f"  {status} category: {cat.name}")

        # --- Products ---
        for data in PRODUCTS:
            cat = cat_map[data["category_slug"]]
            product, created = Product.objects.update_or_create(
                slug=data.get("slug") or __import__("django.utils.text", fromlist=["slugify"]).slugify(data["name"]),
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

            action = "Created" if created else "Updated"
            self.stdout.write(f"  {action} product: {product.name}")

        # --- Discounts ---
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
        self.stdout.write(f"  Seeded {len(DISCOUNTS)} discounts")

        # --- Shipping rules ---
        ShippingRule.objects.all().delete()
        for data in SHIPPING_RULES:
            ShippingRule.objects.create(
                label=data["label"],
                min_order_amount=data["min_order_amount"],
                cost=data["cost"],
                is_active=True,
            )
        self.stdout.write(f"  Seeded {len(SHIPPING_RULES)} shipping rules")

        self.stdout.write(self.style.SUCCESS("[OK] Seeding complete"))
