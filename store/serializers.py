"""
store/serializers.py

DRF serializers that output the EXACT JSON shape the React frontend expects.
All field names are camelCase to match the TypeScript interfaces in
src/types/product.ts.

Frontend interfaces mapped:
  Product       → ProductSerializer
  Category      → CategorySerializer
  Discount      → DiscountSerializer
  ShippingRule  → ShippingRuleSerializer
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Category, Discount, Product, ProductImage, ProductVariant, ShippingRule, User, Address, Order, OrderItem, Cart, CartItem, ContactMessage


# ---------------------------------------------------------------------------
# Category
# ---------------------------------------------------------------------------

class CategorySerializer(serializers.ModelSerializer):
    """
    Maps to:
      { id, name, slug, image, featured?, order?, isActive }
    """

    isActive = serializers.BooleanField(source="is_active")

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "image", "featured", "order", "isActive"]


# ---------------------------------------------------------------------------
# Product (read-only, list + detail)
# ---------------------------------------------------------------------------

class ProductSerializer(serializers.ModelSerializer):
    """
    Exact output shape:
    {
      "id": 1,
      "name": "...",
      "slug": "...",
      "description": "...",
      "price": 120.00,
      "discountPrice": null,
      "categoryId": 1,
      "images": ["url1", "url2"],
      "sizes": ["S", "M"],
      "colors": ["Black", "White"],
      "stock": 28,
      "isActive": true,
      "isFeatured": false,
      "createdAt": "2026-03-10T09:00:00Z"
    }

    `images`  → ordered ProductImage URLs
    `sizes`   → distinct non-empty variant sizes
    `colors`  → distinct non-empty variant colors
    `stock`   → sum of all variant stocks
    """

    discountPrice = serializers.DecimalField(
        source="discount_price",
        max_digits=10,
        decimal_places=2,
        allow_null=True,
        read_only=True,
    )
    categoryId = serializers.IntegerField(source="category_id", read_only=True)
    images = serializers.SerializerMethodField()
    sizes = serializers.SerializerMethodField()
    colors = serializers.SerializerMethodField()
    stock = serializers.SerializerMethodField()
    isActive = serializers.BooleanField(source="is_active", read_only=True)
    isFeatured = serializers.BooleanField(source="is_featured", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "price",
            "discountPrice",
            "categoryId",
            "images",
            "sizes",
            "colors",
            "stock",
            "isActive",
            "isFeatured",
            "createdAt",
        ]

    def get_images(self, obj) -> list[str]:
        # Use prefetched images when available (set by ProductViewSet)
        if hasattr(obj, "_prefetched_objects_cache") and "images" in obj._prefetched_objects_cache:
            return [img.image_url for img in sorted(obj.images.all(), key=lambda i: i.order)]
        return list(obj.images.order_by("order").values_list("image_url", flat=True))

    def get_sizes(self, obj) -> list[str]:
        if hasattr(obj, "_prefetched_objects_cache") and "variants" in obj._prefetched_objects_cache:
            seen: dict[str, None] = {}
            for v in obj.variants.all():
                if v.size:
                    seen[v.size] = None
            return list(seen.keys())
        return list(
            obj.variants.exclude(size="").values_list("size", flat=True).distinct()
        )

    def get_colors(self, obj) -> list[str]:
        if hasattr(obj, "_prefetched_objects_cache") and "variants" in obj._prefetched_objects_cache:
            seen: dict[str, None] = {}
            for v in obj.variants.all():
                if v.color:
                    seen[v.color] = None
            return list(seen.keys())
        return list(
            obj.variants.exclude(color="").values_list("color", flat=True).distinct()
        )

    def get_stock(self, obj) -> int:
        if hasattr(obj, "_prefetched_objects_cache") and "variants" in obj._prefetched_objects_cache:
            return sum(v.stock for v in obj.variants.all())
        from django.db.models import Sum
        result = obj.variants.aggregate(total=Sum("stock"))["total"]
        return result or 0


# ---------------------------------------------------------------------------
# Discount
# ---------------------------------------------------------------------------

class DiscountSerializer(serializers.ModelSerializer):
    """
    Maps to frontend Discount type:
      { id, name, type, value, code?, minOrderAmount?, isActive }
    """

    type = serializers.CharField(source="discount_type", read_only=True)
    minOrderAmount = serializers.DecimalField(
        source="min_order_amount",
        max_digits=10,
        decimal_places=2,
        allow_null=True,
        read_only=True,
    )
    isActive = serializers.BooleanField(source="is_active", read_only=True)

    class Meta:
        model = Discount
        fields = ["id", "name", "type", "value", "code", "minOrderAmount", "isActive"]


# ---------------------------------------------------------------------------
# ShippingRule
# ---------------------------------------------------------------------------

class ShippingRuleSerializer(serializers.ModelSerializer):
    """
    Maps to frontend ShippingRule type:
      { id, minOrderAmount, cost, label, isActive }
    """

    minOrderAmount = serializers.DecimalField(
        source="min_order_amount",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    isActive = serializers.BooleanField(source="is_active", read_only=True)

    class Meta:
        model = ShippingRule
        fields = ["id", "label", "minOrderAmount", "cost", "isActive"]


# ---------------------------------------------------------------------------
# Auth & User
# ---------------------------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    isEmailVerified = serializers.BooleanField(source="is_email_verified", read_only=True)
    firstName = serializers.CharField(source="first_name")
    lastName = serializers.CharField(source="last_name")

    class Meta:
        model = User
        fields = ["id", "email", "firstName", "lastName", "phone", "isEmailVerified"]


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'] = serializers.EmailField()
        if self.username_field in self.fields:
            del self.fields[self.username_field]

    def validate(self, attrs):
        attrs[self.username_field] = attrs.pop('email')
        data = super().validate(attrs)

        # Block login for unverified users
        if not self.user.is_email_verified:
            raise serializers.ValidationError(
                {"message": "Email not verified. Please check your inbox and verify your email before logging in."},
                code="email_not_verified",
            )

        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    firstName = serializers.CharField(source="first_name")
    lastName = serializers.CharField(source="last_name")

    class Meta:
        model = User
        fields = ["email", "password", "firstName", "lastName", "phone"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', '')
        )
        return user


# ---------------------------------------------------------------------------
# Address
# ---------------------------------------------------------------------------

class AddressSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source="full_name")
    addressLine = serializers.CharField(source="address_line")
    isDefault = serializers.BooleanField(source="is_default")

    class Meta:
        model = Address
        fields = ["id", "fullName", "phone", "addressLine", "city", "country", "isDefault"]

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


# ---------------------------------------------------------------------------
# Cart
# ---------------------------------------------------------------------------

class CartItemSerializer(serializers.ModelSerializer):
    productId = serializers.IntegerField(source="product_id", read_only=True)
    name = serializers.CharField(source="product.name", read_only=True)
    price = serializers.DecimalField(source="product.price", max_digits=10, decimal_places=2, read_only=True)
    image = serializers.SerializerMethodField()
    # Accept write fields
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "productId", "product_id", "name", "price", "image", "size", "color", "quantity"]

    def get_image(self, obj):
        first_image = obj.product.images.order_by("order").first()
        if first_image:
            return first_image.image_url
        return ""

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "items"]


# ---------------------------------------------------------------------------
# Order
# ---------------------------------------------------------------------------

class OrderItemSerializer(serializers.ModelSerializer):
    productId = serializers.IntegerField(source="product_id", read_only=True)
    name = serializers.CharField(source="product_name")

    class Meta:
        model = OrderItem
        fields = ["productId", "name", "price", "image", "size", "color", "quantity"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    paymentMethod = serializers.CharField(source="payment_method")
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    estimatedDelivery = serializers.DateTimeField(source="estimated_delivery", read_only=True)

    # Shipping address flat fields mapped to shippingAddress dict
    shippingAddress = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id", "items", "shippingAddress", "paymentMethod",
            "subtotal", "discount", "shipping", "total",
            "status", "createdAt", "estimatedDelivery"
        ]

    def get_shippingAddress(self, obj):
        return {
            "fullName": obj.full_name,
            "email": obj.email,
            "phone": obj.phone,
            "address": obj.address,
            "city": obj.city,
            "country": obj.country
        }


# ---------------------------------------------------------------------------
# Contact Message
# ---------------------------------------------------------------------------

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "subject", "message"]

