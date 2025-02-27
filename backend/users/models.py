from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class FriendStatus(models.TextChoices):
    ACCEPTED = 'accepted', 'Accepted'
    DECLINED = 'declined', 'Declined'
    REQUESTED = 'requested', 'Requested'

class userWithDOB(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    DOB = models.DateField(null=False, blank=False)


class userFriends(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='person1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='person2')
    status = models.TextField(choices=FriendStatus.choices, default=FriendStatus.REQUESTED)
    creationTime = models.DateTimeField(auto_now_add=True)