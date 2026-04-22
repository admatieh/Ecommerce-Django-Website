"""
store/models.py

All models map 1-to-1 with the frontend TypeScript interfaces.

Changes from v1:
  - Product.stock REMOVED – stock lives exclusively on ProductVariant.
    Single-SKU products get one variant with empty size/color.
  - Safe unique slug generation (appends suffix on collision).
  - DB indexes on slug, is_active, is_featured, category FK.
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _unique_slug(model_class, base_slug: str, instance_pk=None) -> str:
    """
    Returns a slug that is guaranteed unique within model_class.
    If base_slug is taken, appends -2, -3, … until a free one is found.
    Excludes the instance itself (for updates that don't change the name).
    """
    slug = base_slug
    qs = model_class.objects.all()
    if instance_pk:
        qs = qs.exclude(pk=instance_pk)

    counter = 2
    while qs.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


# ---------------------------------------------------------------------------
# 1. USER MODEL
# ---------------------------------------------------------------------------

class User(AbstractUser):
    """
    Custom user model extending AbstractUser.

    Frontend ShippingAddress type uses: fullName, email, phone, address, city, country.
    email/phone live here; address details belong to Order.
    """

    email = models.EmailField(unique=True, verbose_name="Email address")
    phone = models.CharField(
        max_length=30,
        blank=True,
        verbose_name="Phone number",
        help_text="Optional – e.g. +1 555 000 0000",
    )
    is_email_verified = models.BooleanField(
        default=False,
        verbose_name="Email Verified"
    )

    REQUIRED_FIELDS = ["email", "first_name", "last_name"]

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self) -> str:
        return self.email or self.username


# ---------------------------------------------------------------------------
# 1.5 ADDRESS MODEL
# ---------------------------------------------------------------------------

class Address(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="addresses",
        verbose_name="User"
    )
    full_name = models.CharField(max_length=200, verbose_name="Full name")
    phone = models.CharField(max_length=30, verbose_name="Phone")
    address_line = models.CharField(max_length=300, verbose_name="Address Line")
    city = models.CharField(max_length=100, verbose_name="City")
    country = models.CharField(max_length=100, verbose_name="Country")
    is_default = models.BooleanField(default=False, verbose_name="Default Address")

    class Meta:
        verbose_name = "Address"
        verbose_name_plural = "Addresses"
        ordering = ["-is_default", "pk"]

    def __str__(self) -> str:
        return f"{self.full_name} - {self.address_line}, {self.city}"

    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(user=self.user).update(is_default=False)
        elif not Address.objects.filter(user=self.user).exists():
            self.is_default = True
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# 2. CATEGORY MODEL
# ---------------------------------------------------------------------------

class Category(models.Model):
    """
    Maps to frontend Category interface:
      { id, name, slug, image, featured?, order?, isActive }

    Slug used for: /collections?category={slug}
    """

    name = models.CharField(max_length=120, verbose_name="Name")
    slug = models.SlugField(
        max_length=140,
        unique=True,
        verbose_name="Slug",
        help_text="Used in /collections?category={slug}",
        db_index=True,
    )
    image = models.URLField(
        max_length=500,
        verbose_name="Image URL",
    )
    featured = models.BooleanField(
        default=False,
        verbose_name="Featured",
        help_text="Show on the landing page featured-categories section",
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="Display order",
        help_text="Lower number = shown first",
    )
    is_active = models.BooleanField(default=True, verbose_name="Active", db_index=True)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["order", "name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)
            self.slug = _unique_slug(Category, base, instance_pk=self.pk)
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# 3. PRODUCT MODEL
# ---------------------------------------------------------------------------

class Product(models.Model):
    """
    Maps to frontend Product interface:
      { id, name, slug, description, price, discountPrice?, categoryId,
        images, sizes?, colors?, stock, isActive, isFeatured?, createdAt }

    `stock` is NOT stored on Product; it is the sum of ProductVariant.stock
    values, computed via the `stock` property below.

    Single-SKU products have one ProductVariant with empty size + color.
    """

    name = models.CharField(max_length=255, verbose_name="Name")
    slug = models.SlugField(
        max_length=280,
        unique=True,
        verbose_name="Slug",
        db_index=True,
    )
    description = models.TextField(verbose_name="Description")
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Price",
    )
    discount_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Discount price",
        help_text="Maps to discountPrice on the frontend",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
        verbose_name="Category",
        db_index=True,
    )
    is_active = models.BooleanField(default=True, verbose_name="Active", db_index=True)
    is_featured = models.BooleanField(
        default=False,
        verbose_name="Featured",
        db_index=True,
        help_text="Show in the landing page featured-products section",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created at")

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)
            self.slug = _unique_slug(Product, base, instance_pk=self.pk)
        super().save(*args, **kwargs)

    # ------------------------------------------------------------------
    # Computed properties – called by serializers
    # ------------------------------------------------------------------

    @property
    def stock(self) -> int:
        """Sum of all variant stocks → frontend Product.stock: number"""
        result = self.variants.aggregate(total=models.Sum("stock"))["total"]
        return result or 0

    @property
    def sizes(self) -> list[str]:
        """Distinct non-empty sizes from variants → Product.sizes: string[]"""
        return list(
            self.variants.exclude(size="")
            .values_list("size", flat=True)
            .distinct()
        )

    @property
    def colors(self) -> list[str]:
        """Distinct non-empty colors from variants → Product.colors: string[]"""
        return list(
            self.variants.exclude(color="")
            .values_list("color", flat=True)
            .distinct()
        )

    @property
    def image_urls(self) -> list[str]:
        """Ordered image URLs → Product.images: string[]"""
        return list(
            self.images.order_by("order").values_list("image_url", flat=True)
        )


# ---------------------------------------------------------------------------
# 4. PRODUCT IMAGE MODEL
# ---------------------------------------------------------------------------

class ProductImage(models.Model):
    """
    Maps to Product.images: string[]
    Each row = one URL. `order` controls the array index (0 = primary).
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name="Product",
    )
    image_url = models.URLField(max_length=500, verbose_name="Image URL")
    order = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="Display order",
        help_text="0 = primary/first image",
    )

    class Meta:
        verbose_name = "Product image"
        verbose_name_plural = "Product images"
        ordering = ["order"]

    def __str__(self) -> str:
        return f"{self.product.name} – image #{self.order}"


# ---------------------------------------------------------------------------
# 5. PRODUCT VARIANT MODEL
# ---------------------------------------------------------------------------

class ProductVariant(models.Model):
    """
    Maps to Product.sizes[] + Product.colors[].

    Each row = a unique (product, size, color) SKU with its own stock.
    Single-SKU products: one row with size="" and color="".
    Stock is sourced exclusively from here; Product has no stock field.
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants",
        verbose_name="Product",
    )
    size = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Size",
        help_text="e.g. XS, S, M, L, XL, 6, 8 – leave blank for single-SKU",
    )
    color = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Color",
        help_text="e.g. Black, Champagne – leave blank for single-SKU",
    )
    stock = models.PositiveIntegerField(default=0, verbose_name="Stock")

    class Meta:
        verbose_name = "Product variant"
        verbose_name_plural = "Product variants"
        unique_together = [("product", "size", "color")]

    def __str__(self) -> str:
        parts = [self.product.name]
        if self.size:
            parts.append(self.size)
        if self.color:
            parts.append(self.color)
        return " / ".join(parts)


# ---------------------------------------------------------------------------
# 6. DISCOUNT MODEL
# ---------------------------------------------------------------------------

class Discount(models.Model):
    """
    Maps to frontend Discount type:
      { id, name, type, value, code?, minOrderAmount?, isActive }
    """

    DISCOUNT_TYPE_CHOICES = [
        ("percentage", "Percentage"),
        ("fixed", "Fixed amount"),
    ]

    name = models.CharField(max_length=120, verbose_name="Name")
    discount_type = models.CharField(
        max_length=10,
        choices=DISCOUNT_TYPE_CHOICES,
        verbose_name="Type",
    )
    value = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        verbose_name="Value",
        help_text="Percentage (0-100) or fixed dollar amount",
    )
    code = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Coupon code",
        help_text="Leave blank for auto-applied discounts",
    )
    min_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Minimum order amount",
    )
    is_active = models.BooleanField(default=True, verbose_name="Active")

    class Meta:
        verbose_name = "Discount"
        verbose_name_plural = "Discounts"

    def __str__(self) -> str:
        return f"{self.name} ({self.discount_type} – {self.value})"


# ---------------------------------------------------------------------------
# 7. SHIPPING RULE MODEL
# ---------------------------------------------------------------------------

class ShippingRule(models.Model):
    """
    Maps to frontend ShippingRule type:
      { id, minOrderAmount, cost, label, isActive }
    """

    label = models.CharField(max_length=100, verbose_name="Label")
    min_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Minimum order amount",
    )
    cost = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        verbose_name="Shipping cost",
        help_text="0 = free shipping",
    )
    is_active = models.BooleanField(default=True, verbose_name="Active")

    class Meta:
        verbose_name = "Shipping rule"
        verbose_name_plural = "Shipping rules"
        ordering = ["min_order_amount"]

    def __str__(self) -> str:
        return f"{self.label} (min ${self.min_order_amount} → ${self.cost})"


# ---------------------------------------------------------------------------
# 8. ORDER MODEL
# ---------------------------------------------------------------------------

class Order(models.Model):
    """
    Maps to frontend Order type:
      { id, items, shippingAddress, paymentMethod, subtotal, discount,
        shipping, total, status, createdAt, estimatedDelivery }

    Shipping address is stored flat; the serializer re-nests it into
    shippingAddress: { fullName, email, phone, address, city, country }.
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("credit_card", "Credit card"),
        ("cod", "Cash on delivery"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
        verbose_name="User",
    )

    # Flat shipping address (mirrors ShippingAddress TS type)
    full_name = models.CharField(max_length=200, verbose_name="Full name")
    email = models.EmailField(verbose_name="Email")
    phone = models.CharField(max_length=30, verbose_name="Phone")
    address = models.CharField(max_length=300, verbose_name="Address")
    city = models.CharField(max_length=100, verbose_name="City")
    country = models.CharField(max_length=100, verbose_name="Country")

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        verbose_name="Payment method",
    )

    # Immutable pricing snapshot
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Subtotal")
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Discount")
    shipping = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Shipping")
    total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Total")

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        verbose_name="Status",
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    estimated_delivery = models.DateTimeField(null=True, blank=True, verbose_name="Estimated delivery")

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Order #{self.pk} – {self.full_name} ({self.status})"


# ---------------------------------------------------------------------------
# 9. ORDER ITEM MODEL
# ---------------------------------------------------------------------------

class OrderItem(models.Model):
    """
    Maps to frontend OrderItem type:
      { productId, name, price, image, size?, color?, quantity }

    Snapshot fields preserve history even after product edits/deletions.
    """

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="Order",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Product",
        help_text="Nullable – preserves history if product is deleted",
    )
    product_name = models.CharField(max_length=255, verbose_name="Product name (snapshot)")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Unit price (snapshot)")
    image = models.URLField(max_length=500, verbose_name="Image URL (snapshot)")
    size = models.CharField(max_length=20, blank=True, verbose_name="Size")
    color = models.CharField(max_length=50, blank=True, verbose_name="Color")
    quantity = models.PositiveIntegerField(default=1, verbose_name="Quantity")

    class Meta:
        verbose_name = "Order item"
        verbose_name_plural = "Order items"

    def __str__(self) -> str:
        return f"{self.quantity}× {self.product_name}"


# ---------------------------------------------------------------------------
# 10. CART MODEL
# ---------------------------------------------------------------------------

class Cart(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="cart",
        verbose_name="User"
    )

    class Meta:
        verbose_name = "Cart"
        verbose_name_plural = "Carts"

    def __str__(self) -> str:
        return f"Cart for {self.user.email}"


# ---------------------------------------------------------------------------
# 11. CART ITEM MODEL
# ---------------------------------------------------------------------------

class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="Cart"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        verbose_name="Product"
    )
    size = models.CharField(max_length=20, blank=True, verbose_name="Size")
    color = models.CharField(max_length=50, blank=True, verbose_name="Color")
    quantity = models.PositiveIntegerField(default=1, verbose_name="Quantity")

    class Meta:
        verbose_name = "Cart item"
        verbose_name_plural = "Cart items"
        unique_together = [("cart", "product", "size", "color")]

    def __str__(self) -> str:
        return f"{self.quantity}× {self.product.name} in Cart"
