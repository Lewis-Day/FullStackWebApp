from django.db import models

from django.contrib.auth.models import User

# Create your models here.

# Model for temporarily holding user's ratings until collaborative training where it is transferred over
# Fields for the userID, gameID and their rating
class NewRatings(models.Model):

    userID = models.IntegerField()
    gameID = models.IntegerField()
    rating = models.IntegerField()

# Model to allow users to save games that have been recommended to them
# The user field links to the default Django user model as a foreign key
# The gameid stores the id of the game to allow information to be fetched for it
# The name of the game saved by the user is stored
# The release date is stored as a string as date may not be available so will be N/A
# Platforms is stored as text as it is a string of platforms supported by the game
class savedRecommendations(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    gameid = models.IntegerField()
    name = models.CharField(max_length=255)
    release = models.CharField(max_length=255, null=True, blank=True)
    platforms = models.TextField()