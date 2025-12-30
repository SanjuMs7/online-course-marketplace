from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
	list_display = ("id", "course", "student", "rating", "created_at")
	list_filter = ("rating", "created_at")
	search_fields = ("course__title", "student__full_name", "comment")
