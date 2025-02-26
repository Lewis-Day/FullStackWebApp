from django.urls import path

from .views import addMessage, getMessages, createConversation

urlpatterns = [
    path('api/createChat/', createConversation.as_view(), name='newChat'),
    path('api/sendMessage/', addMessage.as_view(), name='addMessage'),
    path('api/getMessages/', getMessages.as_view(), name='getMessages'),

]
