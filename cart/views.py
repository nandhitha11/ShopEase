from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from products.models import Product
from .models import Cart, CartItem
from .serializers import (
    CartSerializer,
    AddToCartSerializer,
    UpdateCartSerializer,
)


class CartDetailView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, created = Cart.objects.get_or_create(
            user=self.request.user
        )
        return cart


class AddToCartView(generics.CreateAPIView):
    serializer_class = AddToCartSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']

        if product.stock < quantity:
            return Response(
                {'error': 'Not enough stock available'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response(
            {
                'message': 'Product added to cart successfully',
                'product': product.name,
                'quantity': cart_item.quantity
            },
            status=status.HTTP_201_CREATED
        )


class RemoveFromCartView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart = Cart.objects.get(
            user=self.request.user
        )

        product_id = self.kwargs['product_id']

        return CartItem.objects.get(
            cart=cart,
            product_id=product_id
        )


class UpdateCartQuantityView(generics.UpdateAPIView):
    serializer_class = UpdateCartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart = Cart.objects.get(
            user=self.request.user
        )

        product_id = self.kwargs['product_id']

        return CartItem.objects.get(
            cart=cart,
            product_id=product_id
        )

    def update(self, request, *args, **kwargs):
        cart_item = self.get_object()

        serializer = self.get_serializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        quantity = serializer.validated_data['quantity']

        if cart_item.product.stock < quantity:
            return Response(
                {'error': 'Not enough stock available'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item.quantity = quantity
        cart_item.save()

        return Response(
            {
                'message': 'Cart quantity updated successfully',
                'product': cart_item.product.name,
                'quantity': cart_item.quantity
            },
            status=status.HTTP_200_OK
        )