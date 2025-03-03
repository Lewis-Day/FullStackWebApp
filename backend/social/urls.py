from django.urls import path

from .views import addMessage, getMessages, createConversation, getConversations, deleteConversation
urlpatterns = [
    path('api/createChat/', createConversation.as_view(), name='newChat'),
    path('api/sendMessage/', addMessage.as_view(), name='addMessage'),
    path('api/getMessages/', getMessages.as_view(), name='getMessages'),
    path('api/getConversations/', getConversations.as_view(), name='getConversations'),
    path('api/deleteChat/', deleteConversation.as_view(), name='deleteChat'),

]
