from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import AllowAny
from .models import userWithDOB, userFriends, FriendStatus
from django.contrib.auth import authenticate
from django.db.models import Q

# Create your views here.

class userCreationView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        firstName = request.data.get('firstName')
        lastName = request.data.get('lastName')
        dob = request.data.get('dob')

        if User.objects.filter(username=username):
            return Response({'error':'Username not available'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email):
            return Response({'error':'Email is used by another user'}, status=status.HTTP_400_BAD_REQUEST)
        
        newUser = User.objects.create(
            username = username,
            email = email,
            password = make_password(password),
            first_name = firstName, 
            last_name = lastName,
        )

        userWithDOB.objects.create(user=newUser, DOB = dob)

        return Response({'message':'New User Created'}, status=status.HTTP_201_CREATED)
    

class loginView(APIView):

    def post(self, request):

        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)

        if user is not None:
            return Response({'message':'User Authentication Successful'}, status=status.HTTP_200_OK)
        
        else:
            return Response({'message':'User Authentication Unsuccessful'}, status=status.HTTP_400_BAD_REQUEST)

class fetchUsersView(APIView):

    def get(self, request):

        username = request.query_params.get('username')  

        user = User.objects.get(username = username)
        userDob = userWithDOB.objects.get(user = user)

        user_info = {
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name, 
            'last_name': user.last_name,
            'dob':userDob.DOB.strftime('%Y-%m-%d'),
        }
        
        return Response(user_info, status=status.HTTP_200_OK)

class changeUserDataView(APIView):

    def post(self, request):

        uname = request.data.get('oldUname')
        newUserData = request.data.get('newdata')

        username = newUserData.get('username')
        email = newUserData.get('email')
        fname = newUserData.get('firstName')
        lname = newUserData.get('lastName')
        dob = newUserData.get('dob')

        user = User.objects.get(username = uname)

        if user is not None:

            user.username = username
            user.email = email
            user.first_name = fname
            user.last_name = lname

            user.save()

            userDob = userWithDOB.objects.get(user = user)
            userDob.DOB = dob
            userDob.save()

            return Response({'message':'User Data Change Successful'}, status=status.HTTP_200_OK)

        else:
            return Response({'message':'User Data Change Unsuccessful'}, status=status.HTTP_400_BAD_REQUEST)
        
class changePasswordView(APIView):
    
    def post(self, request):
        
        username = request.data.get('username')
        password = request.data.get('password')


        user = User.objects.get(username = username)

        if user is not None:

            user.set_password(make_password(password))

            user.save()

            return Response({'message':'Password Change Successful'}, status=status.HTTP_200_OK)
        
        else:
            return Response({'message':'Password Change Unsuccessful'}, status=status.HTTP_400_BAD_REQUEST)
        

class forgotPasswordView(APIView):

    def post(self, request):

        username = request.data.get('username')
        email = request.data.get('email')
        dob = request.data.get('dob')
        password = request.data.get('password')

        user = User.objects.get(username = username)
        userDob = userWithDOB.objects.get(user = user)

        if user is not None:

            if user.email == email and userDob.DOB == dob:


                user.set_password(make_password(password))

                user.save()

                return Response({'message':'Password Change Successful'}, status=status.HTTP_200_OK)
            
            else:
                return Response({'message': 'User Details Cannot be Matched'}, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            return Response({'message':'User cannot be found, unsuccessful password change'}, status=status.HTTP_400_BAD_REQUEST)
        

class addFriendView(APIView):

    def post(self, request):

        friendUsername = request.data.get('username')
        userUsername = request.data.get('ownUsername')

        if(friendUsername != userUsername):

            u1 = User.objects.get(username = friendUsername)
            u2 = User.objects.get(username = userUsername)

            query = Q(user1 = u1, user2 = u2) | Q(user1 = u2, user2 = u1)
            friendship = userFriends.objects.filter(query).first()
            if friendship is None:
                friendModel = userFriends.objects.create(
                    user1 = u2,
                    user2 = u1,
                    status = FriendStatus.REQUESTED,
                )

                return Response({'message':'Friend Request Sent'}, status=status.HTTP_200_OK)

            else:
                if friendship.status == FriendStatus.DECLINED:
                    friendship.status = FriendStatus.REQUESTED
                    friendship.save()
                    return Response({'message':'New Friend Request Sent'}, status=status.HTTP_200_OK)

                return Response({'message':'Friendship already exists'}, status=status.HTTP_400_BAD_REQUEST)    
        else:
            return Response({'message':'Cannot friend yourself, error'}, status=status.HTTP_400_BAD_REQUEST)
        

class acceptRequestView(APIView):
    def post(self, request):

        friendUsername = request.data.get('username')
        userUsername = request.data.get('ownUsername')

        if(friendUsername != userUsername):

            u1 = User.objects.get(username = friendUsername)
            u2 = User.objects.get(username = userUsername)

            friendship = userFriends.objects.filter(user1 = u1, user2 = u2, status = FriendStatus.REQUESTED).first()
            if friendship is not None:
                friendship.status = FriendStatus.ACCEPTED
                friendship.save()

                return Response({'message':'Friend Request Accepted'}, status=status.HTTP_200_OK)

            else:

                return Response({'message':'No Friend Request Pending'}, status=status.HTTP_400_BAD_REQUEST)    
        else:
            return Response({'message':'Cannot friend yourself, error'}, status=status.HTTP_400_BAD_REQUEST)
        
class declineFriendRequest(APIView):
    def post(self, request):

        friendUsername = request.data.get('username')
        userUsername = request.data.get('ownUsername')

        if(friendUsername != userUsername):

            u1 = User.objects.get(username = friendUsername)
            u2 = User.objects.get(username = userUsername)

            friendship = userFriends.objects.filter(user1 = u1, user2 = u2, status = FriendStatus.REQUESTED).first()
            if friendship is not None:
                friendship.status = FriendStatus.DECLINED
                friendship.save()

                return Response({'message':'Friend Request Declined'}, status=status.HTTP_200_OK)

            else:

                return Response({'message':'No Friend Request Pending'}, status=status.HTTP_400_BAD_REQUEST)    
        else:
            return Response({'message':'Cannot friend yourself, error'}, status=status.HTTP_400_BAD_REQUEST)
        

class deleteFriendRequest(APIView):
    def post(self, request):

        friendUsername = request.data.get('username')
        userUsername = request.data.get('ownUsername')

        if(friendUsername != userUsername):

            u1 = User.objects.get(username = friendUsername)
            u2 = User.objects.get(username = userUsername)

            friendship = userFriends.objects.filter(user1 = u2, user2 = u1, status = FriendStatus.REQUESTED).first()
            if friendship is not None:
                friendship.delete()
                return Response({'message':'Friend Request Deleted'}, status=status.HTTP_200_OK)

            else:

                return Response({'message':'No Friend Request Pending'}, status=status.HTTP_400_BAD_REQUEST)    
        else:
            return Response({'message':'Cannot friend yourself, error'}, status=status.HTTP_400_BAD_REQUEST)
        

class deleteFriend(APIView):
    def post(self, request):

        friendUsername = request.data.get('username')
        userUsername = request.data.get('ownUsername')

        if(friendUsername != userUsername):

            u1 = User.objects.get(username = friendUsername)
            u2 = User.objects.get(username = userUsername)

            friendship = userFriends.objects.filter(Q(user1 = u1, user2 = u2) | Q(user1 = u2, user2 = u1), status = FriendStatus.ACCEPTED).first()
            if friendship is not None:
                friendship.delete()
                return Response({'message':'Friend Deleted'}, status=status.HTTP_200_OK)

            else:

                return Response({'message':'No Friendship'}, status=status.HTTP_400_BAD_REQUEST)    
        else:
            return Response({'message':'Cannot friend yourself, error'}, status=status.HTTP_400_BAD_REQUEST)
        
class listFriends(APIView):
    def get(self, request):

        username = request.query_params.get('username')  


        u1 = User.objects.get(username = username)

        friendship = userFriends.objects.filter(Q(user1 = u1) | Q(user2 = u1), status = FriendStatus.ACCEPTED).all()
        if friendship is not None:

            friendList = []

            for friend in friendship:
                if friend.user1 == u1:
                    friendList.append(friend.user2)
                else:
                    friendList.append(friend.user1)


            return Response(friendList, status=status.HTTP_200_OK)

        else:

            return Response([], status=status.HTTP_200_OK)    
        
class listFriendRequests(APIView):
    def get(self, request):

        username = request.query_params.get('username')  


        u1 = User.objects.get(username = username)
        friendship = userFriends.objects.filter(user2 = u1, status = FriendStatus.REQUESTED).all()
        if friendship is not None:

            friendList = []

            for friend in friendship:
                friendList.append(friend.user1.username)


            return Response(friendList, status=status.HTTP_200_OK)

        else:

            return Response([], status=status.HTTP_200_OK)    
        

class listSentFriendRequests(APIView):
    def get(self, request):

        username = request.query_params.get('username')  


        u1 = User.objects.get(username = username)
        friendship = userFriends.objects.filter(user1 = u1, status = FriendStatus.REQUESTED).all()
        if friendship is not None:

            friendList = []

            for friend in friendship:
                friendList.append(friend.user2.username)


            return Response(friendList, status=status.HTTP_200_OK)

        else:

            return Response([], status=status.HTTP_200_OK)    

