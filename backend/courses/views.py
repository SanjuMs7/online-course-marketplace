from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.views import APIView
from django.utils import timezone

from .models import Course, Enrollment, Lesson, LessonProgress
from .serializers import (
    CourseSerializer,
    EnrollmentSerializer,
    LessonSerializer,
    LessonProgressSerializer
)
from accounts.permissions import IsInstructor, IsAdmin, IsStudent

# -------------------------
# Course APIs
# -------------------------
class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Course.objects.filter(is_approved=True)

        if user.role == 'STUDENT':
            return Course.objects.filter(is_approved=True)

        if user.role == 'INSTRUCTOR':
            return Course.objects.filter(instructor=user)

        return Course.objects.all()  # ADMIN

    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [permissions.IsAuthenticated, IsInstructor]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsInstructor]
        elif self.action in ['approve', 'reject']:
            permission_classes = [permissions.IsAuthenticated, IsAdmin]
        elif self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]

        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        course = self.get_object()
        course.is_approved = True
        course.save()
        return Response({"message": "Course approved successfully"})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        course = self.get_object()
        course.is_approved = False
        course.save()
        return Response({"message": "Course rejected successfully"})


# -------------------------
# Enrollment APIs
# -------------------------
class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        course = serializer.validated_data['course']

        if Enrollment.objects.filter(
            student=self.request.user,
            course=course
        ).exists():
            raise ValidationError("You are already enrolled in this course.")

        serializer.save(student=self.request.user)


# -------------------------
# Lesson APIs
# -------------------------
class LessonCreateView(generics.CreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]

    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        if course.instructor != self.request.user:
            raise PermissionDenied("You can only add lessons to your own courses.")
        serializer.save()


class LessonUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]

    def perform_update(self, serializer):
        lesson = self.get_object()
        if lesson.course.instructor != self.request.user:
            raise PermissionDenied("You can only update lessons in your own courses.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.course.instructor != self.request.user:
            raise PermissionDenied("You can only delete lessons in your own courses.")
        instance.delete()


class LessonListView(generics.ListAPIView):
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        user = self.request.user

        # Admin can see all lessons
        if user.role == 'ADMIN':
            return Lesson.objects.filter(course_id=course_id)

        # Instructors see lessons in their own course
        if user.role == 'INSTRUCTOR':
            return Lesson.objects.filter(course_id=course_id, course__instructor=user)

        # Students see lessons only if enrolled
        if user.role == 'STUDENT':
            if Enrollment.objects.filter(student=user, course_id=course_id).exists():
                return Lesson.objects.filter(course_id=course_id)
            else:
                return Lesson.objects.none()

        return Lesson.objects.none()


# -------------------------
# Lesson Progress APIs
# -------------------------
class LessonCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, lesson_id):
        user = request.user
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({"detail": "Lesson not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check enrollment
        if not Enrollment.objects.filter(student=user, course=lesson.course).exists():
            return Response({"detail": "You are not enrolled in this course."}, status=status.HTTP_403_FORBIDDEN)

        # Get or create progress
        progress, created = LessonProgress.objects.get_or_create(student=user, lesson=lesson)
        progress.is_completed = True
        if not progress.completed_at:
            progress.completed_at = timezone.now()
        progress.save()

        serializer = LessonProgressSerializer(progress)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CourseProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request, course_id):
        user = request.user

        # Check enrollment
        if not Enrollment.objects.filter(student=user, course_id=course_id).exists():
            return Response({"detail": "You are not enrolled in this course."}, status=status.HTTP_403_FORBIDDEN)

        lessons = Lesson.objects.filter(course_id=course_id)
        progress_list = LessonProgress.objects.filter(student=user, lesson__in=lessons)

        serializer = LessonProgressSerializer(progress_list, many=True)
        return Response(serializer.data)
