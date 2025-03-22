from django.db import models

# Create your models here.

class NewRatings(models.Model):

    userID = models.IntegerField()
    gameID = models.IntegerField()
    rating = models.IntegerField()