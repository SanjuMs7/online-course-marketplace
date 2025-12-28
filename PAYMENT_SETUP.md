# Razorpay Payment Integration - Setup Instructions

## Overview
This implementation integrates Razorpay payment gateway for courses with price > 0. It operates in **TEST MODE** with no real money transactions.

## Backend Setup (Django)

### 1. Razorpay Account Setup
1. Sign up for a Razorpay account at https://razorpay.com/
2. Go to Settings > API Keys
3. Generate **Test Mode** API keys
4. Copy your **Key ID** and **Key Secret**

### 2. Configure Razorpay Keys

**Option 1: Using .env file (Recommended)**

1. Navigate to backend folder and edit `.env` file:
   ```bash
   cd backend
   ```

2. Update the Razorpay credentials in `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
   RAZORPAY_KEY_SECRET=your_actual_test_secret_key
   ```

**Option 2: Direct settings (Not recommended)**

Alternatively, you can directly update `backend/backend/settings.py`:
```python
RAZORPAY_KEY_ID = 'rzp_test_your_actual_key_id'
RAZORPAY_KEY_SECRET = 'your_actual_test_secret_key'
```

⚠️ **Note:** The `.env` file is in `.gitignore` and won't be committed to version control, making it the safer option.

### 3. Database Migrations
The migrations have already been created and applied. The following tables are now available:
- `orders_order` - Stores order information
- `orders_payment` - Stores payment verification details

### 4. API Endpoints
The following endpoints are now available:

- **POST** `/api/orders/create/` - Create a new order for a course
  - Request: `{ "course_id": 1 }`
  - Response: Order details with Razorpay order ID

- **POST** `/api/orders/verify/` - Verify payment after successful transaction
  - Request: Payment details (payment_id, order_id, signature)
  - Response: Verification status and enrollment confirmation

- **GET** `/api/orders/user-orders/` - Get all orders for authenticated user
  - Response: List of user's orders

## Frontend Setup (React)

### 1. Razorpay Script
The Razorpay checkout script is loaded dynamically when payment modal opens. No additional setup needed.

### 2. Payment Flow
1. User browses courses on the Courses page
2. For paid courses (price > 0):
   - Clicking "Enroll" opens PaymentModal
   - User clicks "Pay Now" to initiate payment
   - Razorpay checkout opens
   - After successful payment, verification happens automatically
   - User is enrolled and redirected to course lessons

3. For free courses (price = 0):
   - Direct enrollment without payment

### 3. Test Payment Cards
Use these test cards in Razorpay TEST MODE:

**Success:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

**Other test cards:**
- Failed: 4000 0000 0000 0002
- Insufficient funds: 4000 0000 0000 9995

## Features Implemented

### Backend
✅ Order and Payment models
✅ Order creation with Razorpay integration
✅ Payment signature verification using HMAC
✅ Automatic enrollment after successful payment
✅ Order status tracking (CREATED, PAID, FAILED)
✅ API endpoints for payment operations
✅ Admin interface for orders and payments

### Frontend
✅ PaymentModal component with Razorpay checkout
✅ Test mode instructions displayed in modal
✅ Payment flow integrated in Courses page
✅ Automatic course refresh after payment
✅ Error handling for payment failures
✅ Distinction between free and paid courses

## Security Features
- Payment signature verification using HMAC-SHA256
- Server-side validation of all payment data
- User authentication required for all payment operations
- Student role verification for enrollment
- Duplicate enrollment prevention

## Testing the Integration

### 1. Start the Backend Server
```bash
cd backend
python manage.py runserver
```

### 2. Start the Frontend Server
```bash
cd frontend
npm run dev
```

### 3. Test Payment Flow
1. Create a course with price > 0 as an instructor
2. Log in as a student
3. Go to Courses page
4. Click "Enroll" on a paid course
5. Payment modal opens
6. Click "Pay Now"
7. Use test card: 4111 1111 1111 1111
8. Complete payment
9. Verify enrollment and redirection to lessons

### 4. Test Free Courses
1. Create a course with price = 0
2. Click "Enroll" - should enroll directly without payment

## Important Notes

⚠️ **TEST MODE ONLY**
- No real money will be charged
- Use only test API keys
- Test cards only work in test mode

⚠️ **Production Deployment**
- Replace test keys with live keys
- Implement additional security measures
- Add proper error logging
- Set up webhooks for payment notifications
- Add SSL certificate

## File Structure

### Backend
```
backend/
├── orders/
│   ├── models.py          # Order and Payment models
│   ├── serializers.py     # API serializers
│   ├── views.py           # Payment endpoints
│   ├── urls.py            # URL routing
│   └── admin.py           # Admin configuration
└── backend/
    ├── settings.py        # Razorpay configuration
    └── urls.py            # Include orders URLs
```

### Frontend
```
frontend/
├── src/
│   ├── api/
│   │   └── payment.js                # Payment API functions
│   ├── components/
│   │   └── payment/
│   │       └── PaymentModal.jsx      # Payment modal component
│   └── pages/
│       └── Courses.jsx                # Updated with payment integration
```

## Troubleshooting

### Issue: Payment fails immediately
- Check Razorpay API keys in settings.py
- Verify you're using test mode keys
- Check browser console for errors

### Issue: Signature verification fails
- Ensure RAZORPAY_KEY_SECRET matches your Razorpay account
- Check network requests for proper data transmission

### Issue: Enrollment doesn't happen after payment
- Check backend logs for errors
- Verify payment verification endpoint is working
- Check if student has proper role

## Support Resources
- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Test Cards: https://razorpay.com/docs/payments/payments/test-card-upi-details/
- API Reference: https://razorpay.com/docs/api/

## Contact
For issues or questions, check the implementation code or Razorpay documentation.
