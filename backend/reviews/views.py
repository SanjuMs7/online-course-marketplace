from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from courses.models import Course, Enrollment
from accounts.permissions import IsStudent
from .models import Review
from .serializers import ReviewSerializer


class IsReviewOwnerOrAdmin(permissions.BasePermission):
	def has_object_permission(self, request, view, obj):
		if request.method in permissions.SAFE_METHODS:
			return True
		if not request.user.is_authenticated:
			return False
		return obj.student == request.user or getattr(request.user, "role", None) == "ADMIN"


class CourseReviewListCreateView(generics.ListCreateAPIView):
	serializer_class = ReviewSerializer

	def get_permissions(self):
		if self.request.method == "POST":
			return [permissions.IsAuthenticated(), IsStudent()]
		return [permissions.AllowAny()]

	def get_queryset(self):
		return Review.objects.filter(course_id=self.kwargs["course_id"]).select_related("student")

	def perform_create(self, serializer):
		course = get_object_or_404(Course, id=self.kwargs["course_id"])

		# Only enrolled students can review
		if not Enrollment.objects.filter(student=self.request.user, course=course).exists():
			raise PermissionDenied("You must be enrolled to review this course.")

		serializer.save(student=self.request.user, course=course)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Review.objects.select_related("student", "course")
	serializer_class = ReviewSerializer

	def get_permissions(self):
		if self.request.method in ["PUT", "PATCH", "DELETE"]:
			return [permissions.IsAuthenticated(), IsReviewOwnerOrAdmin()]
		return [permissions.AllowAny()]
