from django.urls import path

from .views import recommendationsView

urlpatterns = [
    path('api/recommendations/', recommendationsView.as_view(), name='recommendations'),
]
