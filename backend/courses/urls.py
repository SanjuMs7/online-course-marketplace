from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    EnrollmentViewSet,
    LessonCreateView,
    LessonUpdateDeleteView,
    LessonListView,
    LessonCompleteView,
    CourseProgressView,
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),

    # Lesson URLs
    path('courses/<int:course_id>/lessons/', LessonListView.as_view(), name='lesson-list'),
    path('lessons/create/', LessonCreateView.as_view(), name='lesson-create'),
    path('lessons/<int:pk>/update/', LessonUpdateDeleteView.as_view(), name='lesson-update'),
    path('lessons/<int:pk>/delete/', LessonUpdateDeleteView.as_view(), name='lesson-delete'),

    # Lesson Progress URLs
    path('lessons/<int:lesson_id>/complete/', LessonCompleteView.as_view(), name='lesson-complete'),
    path('courses/<int:course_id>/progress/', CourseProgressView.as_view(), name='course-progress'),
]
