from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "course",
            "student",
            "student_name",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "course", "student", "created_at", "updated_at"]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
