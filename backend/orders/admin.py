from django.contrib import admin
from .models import Order, Payment


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'course', 'amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'course__title', 'razorpay_order_id']
    readonly_fields = ['razorpay_order_id', 'created_at', 'updated_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'razorpay_payment_id', 'paid_at']
    search_fields = ['razorpay_payment_id', 'order__razorpay_order_id']
    readonly_fields = ['paid_at']
