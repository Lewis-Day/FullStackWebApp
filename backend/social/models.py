from django.db import models

from django.contrib.auth.models import User

# Create your models here.

# Model for managing the conversations between users in the app 
# A conversation is created between two users so these are saved and are foreign keys linking to the default Django user model
# Time is also saved to track friendship
class conversationModel(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversationSender')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversationReceiver')
    creationTime = models.DateTimeField(auto_now_add=True)

# Model for managing messages between users
# All messages for all conversations are saved in this model
# A message has a foreign key to the conversation model above and a foreign key for the user that sent the message
# The time that the message is sent is tracked so it can be displayed to the user and allows messages to be sorted in time order
# The text field stores the message itself
class messageModel(models.Model):

    conversation = models.ForeignKey(conversationModel, on_delete=models.CASCADE, related_name='messages')
    sendingUser = models.ForeignKey(User, on_delete=models.CASCADE, related_name='senderMessages')
    messageTime = models.DateTimeField(auto_now_add=True)
    message = models.TextField()
