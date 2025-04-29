from django.db import models

from django.contrib.auth.models import User

# Create your models here.

class NewRatings(models.Model):

    userID = models.IntegerField()
    gameID = models.IntegerField()
    rating = models.IntegerField()


class savedRecommendations(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    gameid = models.IntegerField()
    name = models.CharField(max_length=255)
    release = models.CharField(max_length=255, null=True, blank=True)
    platforms = models.TextField()