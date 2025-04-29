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

class userwithID(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    recID = models.IntegerField(null=False, blank=False, unique=True)

    def save(self, *args, **kwargs):
        if not self.recID:
            self.recID = nextID()
        super().save(*args, **kwargs)


class userStatus(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=200, blank=True, null=True)

class userFriends(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='person1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='person2')
    status = models.TextField(choices=FriendStatus.choices, default=FriendStatus.REQUESTED)
    creationTime = models.DateTimeField(auto_now_add=True)



def nextID():
    highestCurrentID = userwithID.objects.filter(recID__gte=898130).order_by('-recID').first()

    if highestCurrentID:
        return highestCurrentID.recID + 1
    else:
        return 898130
