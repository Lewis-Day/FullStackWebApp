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

