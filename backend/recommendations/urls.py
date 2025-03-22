from django.urls import path

from .views import recommendationsView, initialRatingsView, addRatingsView

urlpatterns = [
    path('api/recommendations/', recommendationsView.as_view(), name='recommendations'),
    path('api/initialRatings/', initialRatingsView.as_view(), name='initialRatings'),
    path('api/addRatings/', addRatingsView.as_view(), name='addRatings'),
]
