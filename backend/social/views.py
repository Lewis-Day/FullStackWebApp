from datetime import datetime
from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import conversationModel, messageModel
from django.db.models import Q
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from users.models import User


# Create your views here.

class createConversation(APIView):

    def post(self, request):

        sender = request.data.get('user1')
        receiver = request.data.get('user2')

        try:
            sender = User.objects.get(username=sender)
            receiver = User.objects.get(username=receiver)

        except User.DoesNotExist:
            return Response({'error': 'No user with that username'}, status=status.HTTP_404_NOT_FOUND)

        query = Q(user1 = sender.id, user2 = receiver.id) | Q(user1 = receiver.id, user2 = sender.id)

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

        try:
            sender = User.objects.get(username=sender)
            receiver = User.objects.get(username=receiver)

        except User.DoesNotExist:
            return Response({'error': 'No user with that username'}, status=status.HTTP_404_NOT_FOUND)

        query = Q(user1 = sender.id, user2 = receiver.id) | Q(user1 = receiver.id, user2 = sender.id)

        currentConversation = conversationModel.objects.get(query)

        message = messageModel.objects.create(
            conversation = currentConversation,
            sendingUser = sender,
            message = message,
        )

        return Response({'message':'Message saved'}, status=status.HTTP_201_CREATED)

class getMessages(APIView):

    def get(self, request):

        sender = request.query_params.get('user1')
        receiver = request.query_params.get('user2')

        try:
            sender = User.objects.get(username=sender)
            receiver = User.objects.get(username=receiver)

        except User.DoesNotExist:
            return Response({'error': 'No user with that username'}, status=status.HTTP_404_NOT_FOUND)

        query = Q(user1 = sender.id, user2 = receiver.id) | Q(user1 = receiver.id, user2 = sender.id)

        currentConversation = conversationModel.objects.get(query)

        allMessages = messageModel.objects.filter(conversation = currentConversation)
        sortedMessages = allMessages.order_by('messageTime')

        messages = []

        for message in sortedMessages:
            chat = message.conversation
            dt = message.messageTime
            time = dt.strftime("%H:%M")

            user_info = {
                'username' : message.sendingUser.username
            }

            u1_info = {
                'username' : chat.user1.username
            }
            u2_info = {
                'username' : chat.user2.username
            }

            chat_info = {
                'user1' : u1_info,
                'user2' : u2_info,
                'creationTime' : chat.creationTime,
            }

            message_info = {
                'conversation': chat_info,
                'sendingUser': user_info,
                'messageTime': time, 
                'message': message.message, 
            }
            messages.append(message_info)

        return Response(messages, status=status.HTTP_200_OK)


@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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
            
            print(chats)

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
