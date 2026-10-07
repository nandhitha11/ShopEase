
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Wishlist
from products.models import Product


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_list(request):
    wishlist_items = Wishlist.objects.filter(
        user=request.user
    ).select_related('product')

    data = []

    for item in wishlist_items:
        product = item.product

        data.append({
            'id': item.id,
            'product': product.id,
            'name': product.name,
            'description': product.description,
            'price': product.price,
            'stock': product.stock,
            'image': request.build_absolute_uri(product.image.url)
            if product.image
            else None,
            'category': product.category.name
            if product.category
            else None,
        })

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    product_id = request.data.get('product')

    if not product_id:
        return Response(
            {'error': 'Product ID is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    wishlist_item, created = Wishlist.objects.get_or_create(
        user=request.user,
        product=product
    )

    if created:
        return Response(
            {
                'message': 'Product added to wishlist',
                'wishlist_id': wishlist_item.id,
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        {'message': 'Product is already in wishlist'},
        status=status.HTTP_200_OK
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, product_id):
    deleted_count, _ = Wishlist.objects.filter(
        user=request.user,
        product_id=product_id
    ).delete()

    if deleted_count == 0:
        return Response(
            {'error': 'Product not found in wishlist'},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response(
        {'message': 'Product removed from wishlist'},
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_check(request, product_id):
    exists = Wishlist.objects.filter(
        user=request.user,
        product_id=product_id
    ).exists()

    return Response({
        'wishlisted': exists
    })

