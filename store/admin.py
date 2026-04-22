"""
store/admin.py

Admin configuration for all store models.
Prioritises usability for day-to-day catalogue management.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html

from .models import (
    User,
    Category,
    Product,
    ProductImage,
    ProductVariant,
    Discount,
    ShippingRule,
    Order,
    OrderItem,
)


# ---------------------------------------------------------------------------
# Inline helpers
# ---------------------------------------------------------------------------

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("order", "image_url", "preview")
    readonly_fields = ("preview",)

    @admin.display(description="Preview")
    def preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" style="height:60px;border-radius:4px;" />',
                obj.image_url,
            )
        return "—"


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ("size", "color", "stock")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "product_name", "price", "image", "size", "color", "quantity")
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


# ---------------------------------------------------------------------------
# 1. User admin
# ---------------------------------------------------------------------------

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Extends the default UserAdmin to surface the phone field."""

    fieldsets = BaseUserAdmin.fieldsets + (  # type: ignore[operator]
        ("Contact info", {"fields": ("phone",)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (  # type: ignore[operator]
        ("Contact info", {"fields": ("email", "phone")}),
    )

    list_display = ("username", "email", "phone", "is_staff", "is_active", "date_joined")
    search_fields = ("username", "email", "phone", "first_name", "last_name")
    list_filter = ("is_staff", "is_superuser", "is_active")


# ---------------------------------------------------------------------------
# 2. Category admin
# ---------------------------------------------------------------------------

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "order", "featured", "is_active", "thumbnail")
    list_display_links = ("name",)
    list_filter = ("featured", "is_active")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("order", "featured", "is_active")
    ordering = ("order", "name")

    @admin.display(description="Image")
    def thumbnail(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height:50px;border-radius:4px;" />',
                obj.image,
            )
        return "—"


# ---------------------------------------------------------------------------
# 3. Product admin
# ---------------------------------------------------------------------------

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "price",
        "discount_price",
        "stock_total",
        "is_active",
        "is_featured",
        "created_at",
        "primary_image",
    )
    list_display_links = ("name",)
    list_filter = ("is_active", "is_featured", "category")
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("is_active", "is_featured")
    autocomplete_fields = ("category",)

    @admin.display(description="Stock (total)")
    def stock_total(self, obj):
        return obj.stock  # computed property – sum of variant stocks
    date_hierarchy = "created_at"
    ordering = ("-created_at",)

    inlines = [ProductImageInline, ProductVariantInline]

    fieldsets = (
        (None, {
            "fields": ("name", "slug", "description", "category"),
        }),
        ("Pricing", {
            "fields": ("price", "discount_price"),
        }),
        ("Visibility", {
            "fields": ("is_active", "is_featured"),
        }),
    )

    @admin.display(description="Primary image")
    def primary_image(self, obj):
        first = obj.images.order_by("order").first()
        if first:
            return format_html(
                '<img src="{}" style="height:50px;border-radius:4px;" />',
                first.image_url,
            )
        return "—"


# ---------------------------------------------------------------------------
# 4. ProductImage admin (standalone – useful for bulk URL edits)
# ---------------------------------------------------------------------------

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "order", "image_url", "preview")
    list_filter = ("product__category",)
    search_fields = ("product__name", "image_url")
    list_editable = ("order",)
    autocomplete_fields = ("product",)

    @admin.display(description="Preview")
    def preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" style="height:50px;border-radius:4px;" />',
                obj.image_url,
            )
        return "—"


# ---------------------------------------------------------------------------
# 5. ProductVariant admin (standalone – useful for bulk stock updates)
# ---------------------------------------------------------------------------

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ("product", "size", "color", "stock")
    list_filter = ("product__category", "size", "color")
    search_fields = ("product__name", "size", "color")
    list_editable = ("stock",)
    autocomplete_fields = ("product",)


# ---------------------------------------------------------------------------
# 6. Discount admin
# ---------------------------------------------------------------------------

@admin.register(Discount)
class DiscountAdmin(admin.ModelAdmin):
    list_display = ("name", "discount_type", "value", "code", "min_order_amount", "is_active")
    list_filter = ("discount_type", "is_active")
    search_fields = ("name", "code")
    list_editable = ("is_active",)


# ---------------------------------------------------------------------------
# 7. ShippingRule admin
# ---------------------------------------------------------------------------

@admin.register(ShippingRule)
class ShippingRuleAdmin(admin.ModelAdmin):
    list_display = ("label", "min_order_amount", "cost", "is_active")
    list_filter = ("is_active",)
    list_editable = ("is_active",)


# ---------------------------------------------------------------------------
# 8. Order admin
# ---------------------------------------------------------------------------

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "full_name",
        "email",
        "status",
        "payment_method",
        "total",
        "created_at",
    )
    list_display_links = ("id", "full_name")
    list_filter = ("status", "payment_method", "created_at")
    search_fields = ("full_name", "email", "phone", "id")
    readonly_fields = (
        "subtotal",
        "discount",
        "shipping",
        "total",
        "created_at",
        "estimated_delivery",
        "user",
    )
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
    inlines = [OrderItemInline]

    fieldsets = (
        ("Customer", {
            "fields": ("user", "full_name", "email", "phone"),
        }),
        ("Shipping address", {
            "fields": ("address", "city", "country"),
        }),
        ("Payment", {
            "fields": ("payment_method",),
        }),
        ("Pricing snapshot", {
            "fields": ("subtotal", "discount", "shipping", "total"),
        }),
        ("Status & timing", {
            "fields": ("status", "created_at", "estimated_delivery"),
        }),
    )
