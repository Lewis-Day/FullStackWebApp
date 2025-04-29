from django.contrib import admin
from .models import conversationModel, messageModel

# Register your models here.

# Registering conversationModel and messageModel so they can be viewed in the admin panel
admin.site.register(conversationModel)
admin.site.register(messageModel)