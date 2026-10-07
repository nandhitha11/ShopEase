from django.urls import path

from .views import (
    CartDetailView,
    AddToCartView,
    RemoveFromCartView,
    UpdateCartQuantityView,
)


urlpatterns = [
    path(
        '',
        CartDetailView.as_view(),
        name='cart-detail'
    ),

    path(
        'add/',
        AddToCartView.as_view(),
        name='add-to-cart'
    ),

    path(
        'remove/<int:product_id>/',
        RemoveFromCartView.as_view(),
        name='remove-from-cart'
    ),

    path(
        'update/<int:product_id>/',
        UpdateCartQuantityView.as_view(),
        name='update-cart-quantity'
    ),
]