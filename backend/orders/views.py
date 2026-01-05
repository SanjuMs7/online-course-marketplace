from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
import razorpay
import hmac
import hashlib

from .models import Order, Payment, CartItem
from .serializers import OrderSerializer, PaymentSerializer, CartItemSerializer
from courses.models import Course, Enrollment
from accounts.permissions import IsStudent


def get_razorpay_client():
    """Get or create Razorpay client instance"""
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsStudent])
def cart_items(request):
    """List or add cart items for the authenticated student"""
    if request.method == 'GET':
        items = CartItem.objects.filter(user=request.user).select_related('course', 'course__instructor')
        serializer = CartItemSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    course_id = request.data.get('course_id')
    if not course_id:
        return Response({'error': 'Course ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        course = Course.objects.get(id=course_id, is_approved=True)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

    if Enrollment.objects.filter(student=request.user, course=course).exists():
        return Response({'error': 'Already enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)

    item, created = CartItem.objects.get_or_create(user=request.user, course=course)
    serializer = CartItemSerializer(item)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsStudent])
def remove_cart_item(request, course_id):
    """Remove a course from the authenticated student's cart"""
    try:
        item = CartItem.objects.get(user=request.user, course_id=course_id)
    except CartItem.DoesNotExist:
        return Response({'error': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)

    item.delete()
    return Response({'message': 'Removed from cart'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def create_order(request):
    """
    Create a Razorpay order for course payment
    """
    course_id = request.data.get('course_id')
    
    if not course_id:
        return Response({'error': 'Course ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        course = Course.objects.get(id=course_id, is_approved=True)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if course is free
    if course.price <= 0:
        return Response({'error': 'This course is free. No payment required.'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user is already enrolled
    if Enrollment.objects.filter(student=request.user, course=course).exists():
        return Response({'error': 'You are already enrolled in this course'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Create order in database
    order = Order.objects.create(
        user=request.user,
        course=course,
        amount=course.price,
        status='CREATED'
    )
    
    # Create Razorpay order (test mode)
    try:
        # Validate Razorpay keys before creating client
        if not settings.RAZORPAY_KEY_ID or settings.RAZORPAY_KEY_ID == 'rzp_test_your_key_id':
            return Response({
                'error': 'Razorpay is not configured. Please add your Razorpay keys to .env file.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        razorpay_client = get_razorpay_client()
        razorpay_order = razorpay_client.order.create({
            'amount': int(float(course.price) * 100),  # Amount in paise
            'currency': 'INR',
            'receipt': f'order_{order.id}',
            'payment_capture': 1
        })
        
        order.razorpay_order_id = razorpay_order['id']
        order.save()
        
        return Response({
            'order_id': order.id,
            'razorpay_order_id': razorpay_order['id'],
            'amount': float(course.price),
            'currency': 'INR',
            'razorpay_key': settings.RAZORPAY_KEY_ID,
            'course': {
                'id': course.id,
                'title': course.title,
                'price': float(course.price)
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        order.delete()
        import traceback
        print("Razorpay Error:", str(e))
        print(traceback.format_exc())
        return Response({'error': f'Failed to create payment order: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def verify_payment(request):
    """
    Verify Razorpay payment signature and enroll student
    """
    order_id = request.data.get('order_id')
    razorpay_payment_id = request.data.get('razorpay_payment_id')
    razorpay_order_id = request.data.get('razorpay_order_id')
    razorpay_signature = request.data.get('razorpay_signature')
    
    if not all([order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature]):
        return Response({'error': 'Missing payment details'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verify signature
    try:
        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != razorpay_signature:
            order.status = 'FAILED'
            order.save()
            return Response({'error': 'Invalid payment signature'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Payment verified successfully
        Payment.objects.create(
            order=order,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature
        )
        
        order.status = 'PAID'
        order.save()
        
        # Enroll student in course
        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=order.course
        )
        
        return Response({
            'message': 'Payment verified successfully',
            'order_id': order.id,
            'enrollment_id': enrollment.id,
            'course_id': order.course.id
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        order.status = 'FAILED'
        order.save()
        return Response({'error': f'Payment verification failed: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_orders(request):
    """
    Get all orders for the authenticated user
    """
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_instructor_earnings(request):
    """
    Get all paid orders for courses taught by the instructor
    """
    # Get all courses by this instructor
    instructor_courses = Course.objects.filter(instructor=request.user)
    
    # Get all paid orders for these courses
    orders = Order.objects.filter(
        course__in=instructor_courses,
        status='PAID'
    ).select_related('course', 'user').order_by('-created_at')
    
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

