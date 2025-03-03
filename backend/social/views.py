from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import conversationModel, messageModel
from django.db.models import Q


# Create your views here.

class createConversation(APIView):

    def post(self, request):

        sender = request.data.get('user1')
        receiver = request.data.get('user2')

        query = Q(user1 = sender, user2 = receiver) | Q(user1 = receiver, user2 = sender)

        if conversationModel.objects.filter(query).exists():
            return Response({'error':'Chat already exists'}, status=status.HTTP_400_BAD_REQUEST)

        conversation = conversationModel.objects.create(
            user1 = sender,
            user2 = receiver
        )

        return Response({'message':'Chat created'}, status=status.HTTP_201_CREATED)
        
class addMessage(APIView):

    def post(self, request):

        sender = request.data.get('user1')
        receiver = request.data.get('user2')
        message = request.data.get('message')

        query = Q(user1 = sender, user2 = receiver) | Q(user1 = receiver, user2 = sender)

        currentConversation = conversationModel.objects.get(query)

        message = messageModel.objects.create(
            conversation = currentConversation,
            sendingUser = sender,
            message = message,
        )

        return Response({'message':'Message saved'}, status=status.HTTP_201_CREATED)

class getMessages(APIView):

    def get(self, request):

        sender = request.data.get('user1')
        receiver = request.data.get('user2')

        query = Q(user1 = sender, user2 = receiver) | Q(user1 = receiver, user2 = sender)

        currentConversation = conversationModel.objects.get(query)

        allMessages = messageModel.objects.filter(conversation = currentConversation)
        sortedMessages = allMessages.order_by('messageTime')

        return Response(sortedMessages, status=status.HTTP_200_OK)


class getConversations(APIView):
    def get(self, request):
        sender = request.query_params.get('user1')

        query = Q(user1 = sender) | Q(user2 = sender)

        userConversations = conversationModel.objects.filter(query).all()

        if userConversations is not None:

            chats = []

            for chat in userConversations:
                if chat.user1 == sender:
                    chats.append(chat.user2)
                else:
                    chats.append(chat.user1)

            return Response(chats, status=status.HTTP_200_OK)

        else:
            return Response([], status=status.HTTP_200_OK)
    
class deleteConversation(APIView):
    def post(self, request):

        sender = request.data.get('user1')
        receiver = request.data.get('user2')

        query = Q(user1 = sender, user2 = receiver) | Q(user1 = receiver, user2 = sender)

        currentConversation = conversationModel.objects.get(query)

        currentConversation.delete()

        return Response({'message':'Chat deleted'}, status=status.HTTP_200_OK)
