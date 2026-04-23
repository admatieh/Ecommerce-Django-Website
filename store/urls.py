"""
store/urls.py — App-level URL configuration
Wired in via backend/urls.py at /api/
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CategoryViewSet, 
    PricingConfigView, 
    ProductViewSet,
    RegisterView,
    VerifyEmailView,
    UserMeView,
    AddressViewSet,
    OrderViewSet,
    EmailTokenObtainPairView,
    CartView,
    ContactMessageView,
    SubscriberView,
    SubscriberStatusView,
)

router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="product")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"addresses", AddressViewSet, basename="address")
router.register(r"orders", OrderViewSet, basename="order")

urlpatterns = [
    path("", include(router.urls)),
    path("pricing/", PricingConfigView.as_view(), name="pricing-config"),
    
    # Auth endpoints
    path("auth/login/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    
    # User endpoint
    path("user/me/", UserMeView.as_view(), name="user-me"),
    
    # Cart endpoint
    path("cart/", CartView.as_view(), name="cart"),

    # Contact endpoint
    path("contact/", ContactMessageView.as_view(), name="contact"),

    # Subscribe endpoint
    path("subscribe/", SubscriberView.as_view(), name="subscribe"),
    path("subscribe/status/", SubscriberStatusView.as_view(), name="subscribe-status"),
]
