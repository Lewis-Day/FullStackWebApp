from django.contrib import admin
from .models import conversationModel, messageModel

# Register your models here.

admin.site.register(conversationModel)
admin.site.register(messageModel)