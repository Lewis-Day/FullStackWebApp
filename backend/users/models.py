from django.db import models
from django.contrib.auth.models import User

# Create your models here.

# Status of a frienship, acts as an ENUM for the state of the friendship
class FriendStatus(models.TextChoices):
    ACCEPTED = 'accepted', 'Accepted'
    DECLINED = 'declined', 'Declined'
    REQUESTED = 'requested', 'Requested'

# Model that extends the data stored in default Django user model
# Adds the ability to store the date of birth of the user
# Uses a one to one field to ensure that the user can only have one entry in this model - a user cannot have multiple DOBs
class userWithDOB(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    DOB = models.DateField(null=False, blank=False)

# Model that extends the data stored in default Django user model
# Adds the ability to store an extra ID that corresponds to the recommendation system
# Uses a one to one field for the user to ensure they can only have one entry in this model - user can only have one corresponding ID
class userwithID(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    recID = models.IntegerField(null=False, blank=False, unique=True)

    # Function to modify how the recID is saved
    # Allows the function below to be used or uses a recID passed in through the admin panel
    def save(self, *args, **kwargs):
        if not self.recID:
            self.recID = nextID()
        super().save(*args, **kwargs)

# Model that extends the data stored in default Django user model
# Adds the ability to store a status for the user
# Uses a one to one field for the user to ensure they can only have one entry in this model - user can only have one status at a time
class userStatus(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=200, blank=True, null=True)

# Model to manage friendships
# A friendship is made between two users which are foreign keys to the default Django user model
# A status is added with default as REQUESTED
# Time is saved to track friendship
class userFriends(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='person1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='person2')
    status = models.TextField(choices=FriendStatus.choices, default=FriendStatus.REQUESTED)
    creationTime = models.DateTimeField(auto_now_add=True)

# Function to help get the next available recommendation ID for new users
# Filter to find the next highest recommendation id after the current highest 898130
# Add 1 to the value found and this is the user's recID
def nextID():
    highestCurrentID = userwithID.objects.filter(recID__gte=898130).order_by('-recID').first()

    if highestCurrentID:
        return highestCurrentID.recID + 1
    else:
        return 898130
