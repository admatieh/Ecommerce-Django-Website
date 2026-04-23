"""
store/filters.py

django-filter FilterSet for Product.
Supports:
  ?category=dresses        – filter by category slug
  ?inStock=true            – only products with total stock > 0
  ?search=coat             – name / description / category name
  ?sort=price_asc|price_desc|newest  – ordering
"""

import django_filters
from django.db.models import QuerySet, Sum
from .models import Product


class ProductFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(
        field_name="category__slug",
        lookup_expr="iexact",
        label="Category slug",
    )
    inStock = django_filters.BooleanFilter(
        method="filter_in_stock",
        label="In stock only",
    )
    search = django_filters.CharFilter(
        method="filter_search",
        label="Search term",
    )
    sort = django_filters.CharFilter(
        method="filter_sort",
        label="Sort order (price_asc|price_desc|newest)",
    )

    class Meta:
        model = Product
        fields: list = []

    def filter_in_stock(self, queryset: QuerySet, name: str, value: bool) -> QuerySet:
        if value:
            # Annotate total stock and keep only products with stock > 0
            return (
                queryset
                .annotate(total_stock=Sum("variants__stock"))
                .filter(total_stock__gt=0)
            )
        return queryset

    def filter_search(self, queryset: QuerySet, name: str, value: str) -> QuerySet:
        from django.db.models import Q
        term = value.strip()
        if not term:
            return queryset
        return queryset.filter(
            Q(name__icontains=term)
            | Q(description__icontains=term)
            | Q(category__name__icontains=term)
        )

    def filter_sort(self, queryset: QuerySet, name: str, value: str) -> QuerySet:
        mapping = {
            "price_asc": "price",
            "price_desc": "-price",
            "newest": "-created_at",
        }
        order_by = mapping.get(value.lower())
        if order_by:
            return queryset.order_by(order_by)
        return queryset
