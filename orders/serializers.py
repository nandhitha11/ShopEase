
from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    class Meta:
        model = OrderItem

        fields = (
            'id',
            'product',
            'product_name',
            'quantity',
            'price',
        )


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Order

        fields = (
            'id',
            'user',
            'items',
            'full_name',
            'phone',
            'address',
            'city',
            'pincode',
            'payment_method',
            'total_amount',
            'status',
            'created_at',
            'updated_at',
        )

