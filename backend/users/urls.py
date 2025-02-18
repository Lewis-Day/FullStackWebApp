from django.urls import path

from .views import userCreationView, loginView

urlpatterns = [
    path('api/signup/', userCreationView.as_view(), name='signup'),
    path('api/login/', loginView.as_view(), name='login'),
]
