from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import AllowAny
from .models import userWithDOB
from django.contrib.auth import authenticate

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

        user = User.objects.get(username = "Test")
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