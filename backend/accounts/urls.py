from django.urls import path
from .views import RegisterUserView, LoginUserView, UserProfileView, StudentListView, InstructorListView, AdminUserDeleteView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', LoginUserView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('students/', StudentListView.as_view(), name='student-list'),
    path('instructors/', InstructorListView.as_view(), name='instructor-list'),
    path('users/<int:pk>/', AdminUserDeleteView.as_view(), name='admin-user-delete'),
]
