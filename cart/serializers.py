from rest_framework import serializers

from .models import Cart, CartItem
from products.models import Product


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    product_price = serializers.DecimalField(
        source='product.price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = CartItem
        fields = (
            'id',
            'product',
            'product_name',
            'product_price',
            'quantity',
        )


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Cart
        fields = (
            'id',
            'user',
            'items',
            'created_at',
        )


class AddToCartSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all()
    )

    quantity = serializers.IntegerField(
        min_value=1,
        default=1
    )


class UpdateCartSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(
        min_value=1
    )