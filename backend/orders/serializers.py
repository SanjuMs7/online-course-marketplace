from rest_framework import serializers
from .models import Order, Payment
from courses.serializers import CourseSerializer


class OrderSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'course', 'course_details', 'amount', 'status', 
                  'razorpay_order_id', 'created_at', 'updated_at']
        read_only_fields = ['user', 'razorpay_order_id', 'created_at', 'updated_at']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'razorpay_payment_id', 'razorpay_signature', 'paid_at']
        read_only_fields = ['paid_at']
