from rest_framework import serializers
from .models import Course, Enrollment, Lesson, LessonProgress

class CourseSerializer(serializers.ModelSerializer):
    instructor = serializers.StringRelatedField(read_only=True)  # shows __str__ of user
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['instructor', 'is_approved', 'created_at']
    
    def get_is_enrolled(self, obj):
        """Check if the current user is enrolled in this course"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Enrollment.objects.filter(
                student=request.user,
                course=obj
            ).exists()
        return False

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ['student', 'created_at']

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'course', 'title', 'description', 'video_url', 'video_file', 'order', 'duration_minutes']
        read_only_fields = ['id']  # id is auto-generated
        extra_kwargs = {
            'video_url': {
                'required': False,
                'allow_null': True,
                'allow_blank': True,
            },
            'video_file': {
                'required': False,
                'allow_null': True,
            }
        }
    
    def create(self, validated_data):
        """
        When creating a lesson with a video file, automatically set video_url to the file path.
        """
        video_file = validated_data.get('video_file')
        if video_file and not validated_data.get('video_url'):
            lesson = super().create(validated_data)
            # Set video_url to the file URL
            lesson.video_url = lesson.video_file.url
            lesson.save()
            return lesson
        return super().create(validated_data)

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

