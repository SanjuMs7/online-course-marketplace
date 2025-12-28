# """
# Script to fix orders_order table by dropping and recreating it
# """
# import os
# import sys
# import django

# # Setup Django
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
# django.setup()

# from django.db import connection

# # Drop existing tables
# with connection.cursor() as cursor:
#     print("Dropping existing orders tables...")
#     cursor.execute("DROP TABLE IF EXISTS orders_payment CASCADE;")
#     cursor.execute("DROP TABLE IF EXISTS orders_order CASCADE;")
#     print("Tables dropped successfully!")

# print("\nNow run: python manage.py migrate orders")
# print("This will recreate the tables with correct structure.")
