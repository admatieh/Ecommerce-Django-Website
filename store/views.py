"""
store/views.py

DRF ViewSets for the public read-only API.

Endpoints (all read-only, no auth required for GET):
  GET /api/products/               – list active products
  GET /api/products/<id>/          – single product detail
  GET /api/products/<id>/related/  – related products (same category)
  GET /api/categories/             – list active categories
  GET /api/pricing/                – discounts + shipping rules (for frontend pricing engine)
  POST /api/contact/               – submit contact form message

Filtering on /api/products/:
  ?category=dresses
  ?inStock=true
  ?search=coat
  ?sort=price_asc | price_desc | newest
"""

from django.db import transaction
from django.db.models import Prefetch
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.core.mail import send_mail
from django.conf import settings


from .filters import ProductFilter
from .models import (
    Category, Discount, Product, ProductImage, ProductVariant,
    ShippingRule, User, Address, Order, OrderItem, Cart, CartItem,
    ContactMessage,
)
from .serializers import (
    CategorySerializer,
    DiscountSerializer,
    ProductSerializer,
    ShippingRuleSerializer,
    UserSerializer,
    RegisterSerializer,
    AddressSerializer,
    OrderSerializer,
    EmailTokenObtainPairSerializer,
    CartItemSerializer,
    CartSerializer,
    ContactMessageSerializer,
)


def _product_queryset():
    """
    Base queryset with all relations prefetched.
    Using Prefetch objects avoids the N+1 problem for images and variants.
    """
    return (
        Product.objects.filter(is_active=True)
        .select_related("category")
        .prefetch_related(
            Prefetch("images", queryset=ProductImage.objects.order_by("order")),
            Prefetch("variants", queryset=ProductVariant.objects.all()),
        )
    )


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/products/        → list
    GET /api/products/<id>/   → detail
    GET /api/products/<id>/related/ → related products
    """

    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filterset_class = ProductFilter

    def get_queryset(self):
        qs = _product_queryset()
        # Apply filters manually (django-filter integration)
        f = ProductFilter(self.request.query_params, queryset=qs)
        return f.qs

    @action(detail=True, methods=["get"], url_path="related")
    def related(self, request: Request, pk=None) -> Response:
        """
        Returns up to 4 related products:
          1. Same category first
          2. Other categories to fill up to 4
        Matches frontend getRelatedProducts(productId, limit=4).
        """
        try:
            product = Product.objects.get(pk=pk, is_active=True)
        except Product.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        limit = int(request.query_params.get("limit", 4))

        same_category = list(
            _product_queryset()
            .filter(category=product.category)
            .exclude(pk=product.pk)[:limit]
        )
        needed = limit - len(same_category)
        if needed > 0:
            other = list(
                _product_queryset()
                .exclude(category=product.category)
                .exclude(pk=product.pk)[:needed]
            )
        else:
            other = []

        serializer = self.get_serializer(same_category + other, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/categories/       → list
    GET /api/categories/<id>/  → detail
    """

    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Category.objects.filter(is_active=True)


class PricingConfigView(APIView):
    """
    GET /api/pricing/

    Returns discounts + shipping rules so the frontend pricing engine
    can consume live config instead of the hardcoded mockData.

    Response shape:
    {
      "discounts": [...],
      "shippingRules": [...]
    }
    """

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        discounts = Discount.objects.filter(is_active=True)
        shipping_rules = ShippingRule.objects.filter(is_active=True)
        return Response(
            {
                "discounts": DiscountSerializer(discounts, many=True).data,
                "shippingRules": ShippingRuleSerializer(shipping_rules, many=True).data,
            }
        )


# ---------------------------------------------------------------------------
# Auth & User
# ---------------------------------------------------------------------------

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            signer = TimestampSigner()
            token = signer.sign(user.pk)
            verify_url = f"http://localhost:5173/verify-email?token={token}"
            
            send_mail(
                "Verify your email",
                f"Click to verify: {verify_url}",
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=True,
            )
            return Response({"message": "Registration successful. Please check your email to verify."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.query_params.get("token")
        if not token:
            return Response({"detail": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        signer = TimestampSigner()
        try:
            user_id = signer.unsign(token, max_age=86400) # 1 day
            user = User.objects.get(pk=user_id)
            user.is_email_verified = True
            user.save()
            return Response({"message": "Email verified successfully."})
        except (BadSignature, SignatureExpired):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class UserMeView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


# ---------------------------------------------------------------------------
# Address
# ---------------------------------------------------------------------------

class AddressViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


# ---------------------------------------------------------------------------
# Order
# ---------------------------------------------------------------------------

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Checkout flow:
        1. Validate address fields
        2. Get user cart (must have items)
        3. Validate stock for every cart item
        4. Create Order + OrderItems (with pricing snapshot)
        5. Decrement stock on variants
        6. Clear cart
        """
        data = request.data
        
        # Block unverified users
        if not request.user.is_email_verified:
            return Response(
                {"message": "Please verify your email before placing an order."},
                status=status.HTTP_403_FORBIDDEN,
            )

        address = data.get('shippingAddress', {})
        
        required_address_fields = ['fullName', 'email', 'phone', 'address', 'city', 'country']
        for field in required_address_fields:
            if not address.get(field):
                return Response(
                    {"detail": f"Missing required address field: {field}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        
        # Get user cart
        try:
            cart = Cart.objects.get(user=request.user)
            cart_items = cart.items.select_related('product').prefetch_related('product__images', 'product__variants').all()
            if not cart_items.exists():
                return Response({"detail": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
        except Cart.DoesNotExist:
            return Response({"detail": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate stock for every item
        stock_errors = []
        for item in cart_items:
            # Try to find exact variant match
            variant_qs = item.product.variants.all()
            if item.size:
                variant_qs = variant_qs.filter(size=item.size)
            if item.color:
                variant_qs = variant_qs.filter(color=item.color)

            variant = variant_qs.first()
            if not variant:
                stock_errors.append(
                    f"{item.product.name} ({item.size}/{item.color}) is not available."
                )
            elif variant.stock < item.quantity:
                stock_errors.append(
                    f"{item.product.name} only has {variant.stock} in stock (requested {item.quantity})."
                )

        if stock_errors:
            return Response(
                {"detail": "Some items are out of stock.", "errors": stock_errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Compute server-side totals from cart items
        subtotal = 0
        for item in cart_items:
            unit_price = item.product.discount_price if item.product.discount_price else item.product.price
            subtotal += float(unit_price) * item.quantity

        # Accept client discount/shipping since coupon logic is frontend-driven
        discount_amount = float(data.get('discount', 0))
        shipping_amount = float(data.get('shipping', 0))
        total = max(0, subtotal - discount_amount) + shipping_amount

        # Create order
        from datetime import timedelta
        from django.utils import timezone
        estimated_delivery = timezone.now() + timedelta(days=5)

        order = Order.objects.create(
            user=request.user,
            full_name=address.get('fullName', ''),
            email=address.get('email', request.user.email),
            phone=address.get('phone', ''),
            address=address.get('address', ''),
            city=address.get('city', ''),
            country=address.get('country', ''),
            payment_method=data.get('paymentMethod', 'credit_card'),
            subtotal=subtotal,
            discount=discount_amount,
            shipping=shipping_amount,
            total=total,
            estimated_delivery=estimated_delivery,
        )

        # Create order items + decrement stock
        for item in cart_items:
            unit_price = item.product.discount_price if item.product.discount_price else item.product.price
            first_image = item.product.images.order_by('order').first()

            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                price=unit_price,
                image=first_image.image_url if first_image else '',
                size=item.size,
                color=item.color,
                quantity=item.quantity,
            )

            # Decrement variant stock
            variant_qs = item.product.variants.all()
            if item.size:
                variant_qs = variant_qs.filter(size=item.size)
            if item.color:
                variant_qs = variant_qs.filter(color=item.color)
            variant = variant_qs.first()
            if variant:
                variant.stock = max(0, variant.stock - item.quantity)
                variant.save()

        # Clear cart
        cart_items.delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Cart
# ---------------------------------------------------------------------------

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = cart.items.select_related('product').prefetch_related('product__images').all()
        return Response(CartItemSerializer(items, many=True).data)

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('productId')
        size = request.data.get('size', '')
        color = request.data.get('color', '')
        quantity = int(request.data.get('quantity', 1))

        item, created = CartItem.objects.get_or_create(
            cart=cart, product_id=product_id, size=size, color=color,
            defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += quantity
            item.save()
        
        return Response(CartItemSerializer(item).data)

    def put(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('productId')
        size = request.data.get('size', '')
        color = request.data.get('color', '')
        quantity = int(request.data.get('quantity', 1))

        try:
            item = CartItem.objects.get(cart=cart, product_id=product_id, size=size, color=color)
            if quantity > 0:
                item.quantity = quantity
                item.save()
                return Response(CartItemSerializer(item).data)
            else:
                item.delete()
                return Response({"success": True})
        except CartItem.DoesNotExist:
            return Response({"detail": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.query_params.get('productId') or request.data.get('productId')
        size = request.query_params.get('size', '') or request.data.get('size', '')
        color = request.query_params.get('color', '') or request.data.get('color', '')

        if not product_id:
            # Clear entire cart if no productId
            cart.items.all().delete()
        else:
            cart.items.filter(product_id=product_id, size=size, color=color).delete()
            
        return Response({"success": True})


# ---------------------------------------------------------------------------
# Contact
# ---------------------------------------------------------------------------

class ContactMessageView(APIView):
    """
    POST /api/contact/
    Accepts { name, email, subject, message } and saves to DB.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Your message has been sent successfully."},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Subscriber
# ---------------------------------------------------------------------------

class SubscriberView(APIView):
    """
    POST /api/subscribe/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        from store.models import Subscriber

        user = request.user

        if not user.is_authenticated:
            return Response(
                {"message": "You must be logged in to subscribe"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_email_verified:
            return Response(
                {"message": "Verify your email first"},
                status=status.HTTP_403_FORBIDDEN
            )

        subscriber, created = Subscriber.objects.get_or_create(email=user.email, defaults={"user": user})
        
        if not created:
            return Response(
                {"message": "You are already subscribed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({"message": "Subscribed successfully"})


class SubscriberStatusView(APIView):
    """
    GET /api/subscribe/status/
    """
    from rest_framework.permissions import IsAuthenticated
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from store.models import Subscriber
        is_subscribed = Subscriber.objects.filter(user=request.user).exists()
        return Response({"isSubscribed": is_subscribed})
