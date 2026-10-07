
from django.db import transaction

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from cart.models import Cart
from .models import Order, OrderItem
from .serializers import OrderSerializer


class CreateOrderView(generics.CreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):

        # Get checkout details
        full_name = request.data.get('full_name')
        phone = request.data.get('phone')
        address = request.data.get('address')
        city = request.data.get('city')
        pincode = request.data.get('pincode')
        payment_method = request.data.get(
            'payment_method',
            'Cash on Delivery'
        )

        # Validate checkout details
        if not full_name:
            return Response(
                {'error': 'Full name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not phone:
            return Response(
                {'error': 'Phone number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not address:
            return Response(
                {'error': 'Delivery address is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not city:
            return Response(
                {'error': 'City is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not pincode:
            return Response(
                {'error': 'Pincode is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart = Cart.objects.filter(
            user=request.user
        ).first()

        if not cart:
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_items = cart.items.select_related(
            'product'
        ).all()

        if not cart_items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        total_amount = 0

        for cart_item in cart_items:

            product = cart_item.product

            if product.stock < cart_item.quantity:
                return Response(
                    {
                        'error': (
                            f'Not enough stock for '
                            f'{product.name}'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            total_amount += (
                product.price * cart_item.quantity
            )

        order = Order.objects.create(
            user=request.user,
            full_name=full_name,
            phone=phone,
            address=address,
            city=city,
            pincode=pincode,
            payment_method=payment_method,
            total_amount=total_amount
        )

        for cart_item in cart_items:

            product = cart_item.product

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=cart_item.quantity,
                price=product.price
            )

            product.stock -= cart_item.quantity
            product.save()

        cart.items.all().delete()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related(
            'items__product'
        ).order_by('-created_at')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related(
            'items__product'
        )

