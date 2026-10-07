
from django.urls import path

from .views import (
    wishlist_list,
    add_to_wishlist,
    remove_from_wishlist,
    wishlist_check,
)


urlpatterns = [
    path('', wishlist_list, name='wishlist-list'),
    path('add/', add_to_wishlist, name='wishlist-add'),
    path(
        'remove/<int:product_id>/',
        remove_from_wishlist,
        name='wishlist-remove'
    ),
    path(
        'check/<int:product_id>/',
        wishlist_check,
        name='wishlist-check'
    ),
]

