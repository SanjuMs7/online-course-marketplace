from django.urls import path
from . import views
from .test_views import test_razorpay_config

urlpatterns = [
    path('create/', views.create_order, name='create_order'),
    path('verify/', views.verify_payment, name='verify_payment'),
    path('user-orders/', views.get_user_orders, name='user_orders'),
    path('instructor-earnings/', views.get_instructor_earnings, name='instructor_earnings'),
    path('cart/', views.cart_items, name='cart_items'),
    path('cart/<int:course_id>/', views.remove_cart_item, name='remove_cart_item'),
    path('test-config/', test_razorpay_config, name='test_razorpay_config'),
]
