from django.db import models
from django.conf import settings
from courses.models import Course


class Review(models.Model):
	course = models.ForeignKey(
		Course,
		on_delete=models.CASCADE,
		related_name="reviews",
	)
	student = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="reviews",
		limit_choices_to={"role": "STUDENT"},
	)
	rating = models.PositiveSmallIntegerField()
	comment = models.TextField(blank=True, default="")
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		unique_together = ("course", "student")
		ordering = ["-created_at"]

	def __str__(self):
		return f"{self.course.title} review by {self.student.full_name}"
