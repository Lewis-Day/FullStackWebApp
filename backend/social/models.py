from django.db import models

from django.contrib.auth.models import User

# Create your models here.



class conversationModel(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversationSender')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversationReceiver')
    creationTime = models.DateTimeField(auto_now_add=True)

class messageModel(models.Model):

    conversation = models.ForeignKey(conversationModel, on_delete=models.CASCADE, related_name='messages')
    sendingUser = models.ForeignKey(User, on_delete=models.CASCADE, related_name='senderMessages')
    messageTime = models.DateTimeField(auto_now_add=True)
    message = models.TextField()
