from rest_framework import serializers
from .models import Course, Enrollment, Lesson, LessonProgress

class CourseSerializer(serializers.ModelSerializer):
    instructor = serializers.StringRelatedField(read_only=True)  # shows __str__ of user
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['instructor', 'is_approved', 'created_at']

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ['student', 'created_at']

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'course', 'title', 'description', 'video_url', 'order', 'duration_minutes']
        read_only_fields = ['id']  # id is auto-generated

    def validate(self, attrs):
        """
        Ensure the instructor creating/updating the lesson owns the course.
        """
        request = self.context.get('request')
        course = attrs.get('course')
        if request and request.user.role == 'INSTRUCTOR':
            if course.instructor != request.user:
                raise serializers.ValidationError("You can only add lessons to your own courses.")
        return attrs
    
class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ['id', 'student', 'lesson', 'is_completed', 'completed_at']
        read_only_fields = ['id', 'student', 'completed_at']

    def update(self, instance, validated_data):
        """
        When a student marks a lesson as completed, automatically set completed_at.
        """
        instance.is_completed = validated_data.get('is_completed', instance.is_completed)
        if instance.is_completed and not instance.completed_at:
            from django.utils import timezone
            instance.completed_at = timezone.now()
        instance.save()
        return instance

