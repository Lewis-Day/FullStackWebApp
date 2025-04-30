from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import AllowAny
from .models import userWithDOB, userFriends, FriendStatus, userwithID, userStatus
from django.contrib.auth import authenticate
from django.db.models import Q
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import authentication_classes, permission_classes

# Create your views here.


# View to create a new user
# Get all values passed through in POST and store in variables
# Ensure users have unique usernames and ensure email hasn't been used before to create an account
# Create a new instance of the User model
    # Use the make_password() function to hash the password correctly
# Create an instance of the userwithDOB and userwithID models, using the user model just created   
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
        userwithID.objects.create(user=newUser)

        return Response({'message':'New User Created'}, status=status.HTTP_201_CREATED)
    

# View for login
# Authenticate the user with the username and password passed using POST
# If the user is able to be authenticated, refresh the token and get the usre object
# Return the access token for authentication and the user's username
class loginView(APIView):

    def post(self, request):

        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)

        if user is not None:
            token = RefreshToken.for_user(user)
            user = User.objects.get(username = username)

            return Response({'message':'User Authentication Successful',
                             'user' : str(user.username),
                             'refresh': str(token),
                             'access' : str(token.access_token)}, status=status.HTTP_200_OK)
        
        else:
            return Response({'message':'User Authentication Unsuccessful'}, status=status.HTTP_400_BAD_REQUEST)

# Logout view
# Just returns as there's no backend functionality for it
class logoutView(APIView):
    def post(self, request): 
        return Response({'message':'Logout Successful'}, status=status.HTTP_200_OK)   

# View for fetching user information
# Fetch the user from the Django User model
# Fetch the userWithDOB entry using the user just found
# Organise data requried in JSON format to return
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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

# View for changing the user's username
# Collect all the data from the POST request and store in variables
# Fetch the user entry using the old username passed
# If the user exists:
    # Set all data for the user entry
    # Save user
    # Update the userWithDOB and save
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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

# View for changing user's password
# Get the username and password from the POST request
# If the user exists:
    # Set the new password using the make_password() function to correctly hash the password
    # Update the user entry
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])        
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
        
# View to process the forgot password
# Checks user exists with user model and gets the dob model of the user
# Ensures all of the data provided is the same as what the user gave
# If same then user password change takes place and saves the user model
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

#View for adding friends
#  Ensures users aren't trying to friend themself
# Gets user model for each user
# Queries to find whether a friendship exists
# If it already exists and friend previously declined, change status to requested
# If friendship doesn't exist then a new entry in the userFriends model is created
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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

# View for accepting a friend request
# Ensures the friends aren't trying to accept a request for themself
# Get entries for each user from user model
# Find friendship from userFriends model
# If it exists, set status to accepted and save    
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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

# View for declining a friend request
# Ensures the friends aren't trying to decline a request for themself
# Get entries for each user from user model
# Find friendship from userFriends model
# If it exists, set status to declined and save 
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])        
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

# View for deleting a friend request
# Ensures the friends aren't trying to delete a request for themself
# Get entries for each user from user model
# Find friendship from userFriends model
# If it exists, delete the entry in the userFriends model         
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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

# View for removing a friend
# Ensures the friends aren't trying to remove themself as a friend
# Get entries for each user from user model
# Find friendship from userFriends model
# If it exists, delete the userFriends entry in model        
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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

# View to get friends of a user
# Get user object
# Filter using a query to find all friends of a user
# If at least one exists, create a list to save list of friends
# Add the friend of the user to the list - may be user1 or user2 of the friendship so a check is done
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
class listFriends(APIView):
    def get(self, request):

        username = request.query_params.get('username')  


        u1 = User.objects.get(username = username)

        friendship = userFriends.objects.filter(Q(user1 = u1) | Q(user2 = u1), status = FriendStatus.ACCEPTED).all()
        if friendship is not None:

            friendList = []

            for friend in friendship:
                if friend.user1 == u1:
                    
                    user_info = {
                        'username': friend.user2.username,
                    }
                    friendList.append(user_info)
                else:
                    user_info = {
                        'username': friend.user1.username,
                    }
                    friendList.append(user_info)


            return Response(friendList, status=status.HTTP_200_OK)

        else:

            return Response([], status=status.HTTP_400_BAD_REQUEST)    

# View to list the friend requests incoming for a user 
# Fetch user entry from user model
# Filter userFriends model to get all users that match the user and have status requested
# Add all users to the list to return to the frontend
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])        
class listFriendRequests(APIView):
    def get(self, request):

        username = request.query_params.get('username')  


        u1 = User.objects.get(username = username)
        friendship = userFriends.objects.filter(user2 = u1, status = FriendStatus.REQUESTED).all()
        print("FRIENDSHIP", friendship)
        if friendship is not None:

            friendList = []

            for friend in friendship:
                user_info = {
                    'username': friend.user1.username,
                }
                friendList.append(user_info)

                print(user_info)


            return Response(friendList, status=status.HTTP_200_OK)

        else:

            return Response([], status=status.HTTP_400_BAD_REQUEST)    
        
# View to friend request outgoing for the user (they have sent)
# Fetch user entry from user model
# Filter userFriends model to get all users that match the user and have status requested
# Add all users to the list to return to the frontend
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
class listSentFriendRequests(APIView):
    def get(self, request):

        username = request.query_params.get('username')  


        u1 = User.objects.get(username = username)
        friendship = userFriends.objects.filter(user1 = u1, status = FriendStatus.REQUESTED).all()
        if friendship is not None:

            friendList = []

            for friend in friendship:

                user_info = {
                    'username': friend.user2.username,
                }
                friendList.append(user_info)


            return Response(friendList, status=status.HTTP_200_OK)

        else:

            return Response([], status=status.HTTP_400_BAD_REQUEST)    

# View to set the user's status
# Get the user model
# If the user exists, try getting the userStatus entry for that user  then set the game status as the new game and save
# If the userStatus entry doesn't exist, create a new entry with the user and the game passed in
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
class setUserStatus(APIView):
    def post(self, request):

        username = request.data.get('username')
        gameName = request.data.get('game')

        user = User.objects.get(username=username)

        if user is not None:
            try:
                newUserStatus = userStatus.objects.get(user=user)
                newUserStatus.status = gameName
                newUserStatus.save()
                return Response({'message': "success"}, status=status.HTTP_200_OK)
            
            except userStatus.DoesNotExist:
                userStatus.objects.create(user=user, status=gameName)
                return Response({'message': "success"}, status=status.HTTP_200_OK)


        else:
            return Response([], status=status.HTTP_400_BAD_REQUEST) 

# View to fetch the user's status
# Get the user model
# If the user exists, get the userStatus entry from the model and get the status field
# Return the status field
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
class getUserStatus(APIView):
    def get(self, request):

        username = request.query_params.get('username')  


        user = User.objects.get(username = username)

        if user is not None:
           newUserStatus = userStatus.objects.get(user=user)
           game = newUserStatus.status
           return Response({'status' : game}, status=status.HTTP_200_OK)

        else:

            return Response([], status=status.HTTP_400_BAD_REQUEST)

