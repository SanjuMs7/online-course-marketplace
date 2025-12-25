from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()

# 1️⃣ Registration Serializer
class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_role(self, value):
        if value not in ['STUDENT', 'INSTRUCTOR']:
            raise serializers.ValidationError("Role must be STUDENT or INSTRUCTOR")
        return value

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


# 2️⃣ Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'is_active', 'is_staff', 'created_at']


# 3️⃣ General User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'role']
