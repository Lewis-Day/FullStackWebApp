from django.urls import path

from .views import recommendationsView, initialRatingsView, addRatingsView, wildCardView, addSavedRecommendation, getSavedRecommendation

urlpatterns = [
    path('api/recommendations/', recommendationsView.as_view(), name='recommendations'),
    path('api/initialRatings/', initialRatingsView.as_view(), name='initialRatings'),
    path('api/addRatings/', addRatingsView.as_view(), name='addRatings'),
    path('api/wildcardRecommendation/', wildCardView.as_view(), name='wildcard'),
    path('api/saveRecommendation/', addSavedRecommendation.as_view(), name='saveRecommendation'),
    path('api/getSavedRecommendation/', getSavedRecommendation.as_view(), name='getSavedRecommendation'),
]
