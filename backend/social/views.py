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

# View to create a new conversation
# Ensures that the users creating the conversation exist in the User model
# Create the query to find whether a conversation exists between the users - either user started it
# If the conversation doesn't exist then create a new instance in the conversation model
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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

# View to add a message to the message model 
# Get data passed through POST and set to variables
# Ensure the users exist, otherwise the query cannot be made
# Query using the sender and receiver to find whether a conversation exists between them - only one has to make it
# Once the conversation has been found between users, add a new instance of the message model
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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
    
        try:
            currentConversation = conversationModel.objects.get(query)
        
        except conversationModel.DoesNotExist:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

        message = messageModel.objects.create(
            conversation = currentConversation,
            sendingUser = sender,
            message = message,
        )

        return Response({'message':'Message saved'}, status=status.HTTP_201_CREATED)

# View for getting messages for a particular conversation
# Get the users and ensure that they exist
# Query to find the conversation using the users given
# Get all the messages for the conversation found and sort by time
# For each message found, 
    # Get the message info ready to be returned
    # Requires getting data from all previous steps to build the message data - users and conversations
# Return the list of messages
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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

        try:
            currentConversation = conversationModel.objects.get(query)
        
        except conversationModel.DoesNotExist:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

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


# View to get conversations that users have created
# Query to find all instances of conversations that the user has created
# If there are conversations that the user has:
    # Create a list for storing the usernames of the users the user is chatting with in object form as this is what frontend is expecting
    # Depending on where the user is in terms of user1 in the conversation or user2 in the conversation, add the other user to the list
    # Return the list of the users the user has been chatting with (the individual conversations)
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
class getConversations(APIView):
    def get(self, request):
        sender = request.query_params.get('username')

        try:
            sender = User.objects.get(username=sender)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        

        query = Q(user1 = sender) | Q(user2 = sender)

        userConversations = conversationModel.objects.filter(query).all()

        if userConversations is not None:

            chats = []

            for chat in userConversations:
                if chat.user1 == sender:
                    chats.append({"username" : chat.user2.username})
                else:
                    chats.append({"username" : chat.user1.username})

            return Response(chats, status=status.HTTP_200_OK)

        else:
            return Response([], status=status.HTTP_200_OK)

# View to delete a conversation between two users
# Get users and make sure they exist
# Query to find the conversation - as it will only be listed under one of the users
# Once the conversation has been found, delete it 
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])    
class deleteConversation(APIView):
    def post(self, request):

        sender = request.data.get('user1')
        receiver = request.data.get('user2')

        try:
            sender = User.objects.get(username=sender)
            receiver = User.objects.get(username=receiver)
        
        except User.DoesNotExist:
            return Response({'error': 'No user with that username'}, status=status.HTTP_404_NOT_FOUND)

        query = Q(user1 = sender, user2 = receiver) | Q(user1 = receiver, user2 = sender)

        try:
            currentConversation = conversationModel.objects.get(query)
        
        except conversationModel.DoesNotExist:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

        currentConversation.delete()

        return Response({'message':'Chat deleted'}, status=status.HTTP_200_OK)
