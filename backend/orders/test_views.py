from django.http import JsonResponse
from django.conf import settings

def test_razorpay_config(request):
    """Test endpoint to check Razorpay configuration"""
    return JsonResponse({
        'razorpay_configured': bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_ID != 'rzp_test_your_key_id'),
        'razorpay_key_id': settings.RAZORPAY_KEY_ID[:15] + '...' if settings.RAZORPAY_KEY_ID else None,
        'has_secret': bool(settings.RAZORPAY_KEY_SECRET and settings.RAZORPAY_KEY_SECRET != 'your_test_secret_key'),
    })
