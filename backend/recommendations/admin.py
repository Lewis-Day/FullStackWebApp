from django.contrib import admin

# Register your models here.
from .models import NewRatings, savedRecommendations

# Registering NewRatings and savedRecommendations so they can be viewed in the admin panel
admin.site.register(NewRatings)
admin.site.register(savedRecommendations)