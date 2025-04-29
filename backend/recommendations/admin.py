from django.contrib import admin

# Register your models here.
from .models import NewRatings, savedRecommendations

admin.site.register(NewRatings)
admin.site.register(savedRecommendations)