# Environment Variables Setup Guide

## Backend Environment Variables

The backend now uses `.env` file for sensitive configuration. This is a **security best practice** that:
- Keeps sensitive data out of version control
- Makes it easy to change settings per environment
- Prevents accidental exposure of secrets

### Setup Steps

1. **Copy the example file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Update `.env` with your actual values:**
   ```env
   # Django Settings
   SECRET_KEY=your-actual-secret-key
   DEBUG=True

   # Database Configuration
   DB_NAME=online_course_db
   DB_USER=postgres
   DB_PASSWORD=your-actual-db-password
   DB_HOST=localhost
   DB_PORT=5432

   # Razorpay Configuration (Test Mode)
   RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
   RAZORPAY_KEY_SECRET=your_actual_test_secret_key
   ```

3. **Get Razorpay Test Keys:**
   - Sign up at https://razorpay.com/
   - Go to Settings > API Keys (Test Mode)
   - Copy your Key ID and Key Secret
   - Paste them in `.env` file

### Important Notes

⚠️ **Security:**
- `.env` file is already in `.gitignore` - it won't be committed
- Never commit `.env` to version control
- Use `.env.example` as template for team members

✅ **Benefits:**
- Easy environment-specific configuration
- Better security for sensitive data
- Simple deployment process

### Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key for cryptographic signing | Long random string |
| `DEBUG` | Enable debug mode (True for development) | True/False |
| `DB_NAME` | PostgreSQL database name | online_course_db |
| `DB_USER` | Database username | postgres |
| `DB_PASSWORD` | Database password | your_password |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID (Test Mode) | rzp_test_... |
| `RAZORPAY_KEY_SECRET` | Razorpay API Key Secret (Test Mode) | secret_key... |

### For Production

When deploying to production:
1. Set `DEBUG=False`
2. Generate new `SECRET_KEY`
3. Use production Razorpay keys
4. Configure proper database credentials
5. Set `ALLOWED_HOSTS` in settings.py
