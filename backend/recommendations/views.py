from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
import tensorflow as tf
import pandas as pd
import sqlite3
import requests
import numpy as np
import os
from users.models import userwithID, User
from .models import NewRatings
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


# Create your views here.

@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
class recommendationsView(APIView):

    def get(self, request):

        # dbConn = sqlite3.connect('/Users/lewisday/Documents/University/Year 3/Project/FullStackWebApp/database/dataset.db')
        db_path = '/Users/lewisday/Documents/University/Year 3/Project/FullStackWebApp/database/dataset.db'
        if not os.path.exists(db_path):
            return JsonResponse({"error": "Database file not found"}, status=500)
        dbConn = sqlite3.connect(db_path)


        # userToRecommend = int(input("Enter User ID to Recommend: "))

        # userToRecommend = int(2459)

        # userToRecommend = request.GET.get('userId', 2459)  # Default user if none provided

        user = request.user
        uidUser = userwithID.objects.get(user = user)
        uid = uidUser.recID
        print(user)
        print(uidUser)
        print(uid)

        userToRecommend = uid

        # get all unique games
        uniqueGamesdf = pd.read_sql('SELECT DISTINCT gameIdFact FROM ratings', dbConn)
        uniqueGames = uniqueGamesdf['gameIdFact'].unique()

        # # get all games rated by user

        userGamesdf = pd.read_sql(f"SELECT gameIdFact FROM ratings WHERE userId = ?", dbConn, params=(userToRecommend,))
        rated = userGamesdf['gameIdFact']

        # get games not rated by the user
        gamesNotRated = pd.Series(uniqueGames)[~pd.Series(uniqueGames).isin(rated)]

        # Create a new data frame for organising the required columns
        ds = pd.DataFrame()

        ds['games'] = gamesNotRated
        ds['user'] = userToRecommend

        user = ds['user']
        game = ds['games']


        # load my model saved from earlier
        model = tf.keras.models.load_model('/Users/lewisday/Documents/University/Year 3/Project/FullStackWebApp/MLModels/optimumModel2.h5')

        # Convert to NumPy arrays
        user_array = np.array(ds['user'])
        game_array = np.array(ds['games']) 

        # Predict
        prediction = model.predict([user_array, game_array])

        # Create new data frame for the columns that I need
        predictDF = pd.DataFrame()
        predictDF['game'] = game
        predictDF['rating'] = prediction

        # Sort by ratings column - get the top ratings
        sorted = predictDF.sort_values(by='rating', ascending=False)
        # Get top 5
        recommendations = sorted.head(5)
        # Rename column
        recommendations.rename(columns={'game':'factorised'}, inplace=True)

        # Read the file for conversion to igdb id
        gameMappings = pd.read_csv('/Users/lewisday/Documents/University/Year 3/Project/FullStackWebApp/helperFiles/FactorisedtoGameID.csv')

        # Merge with the recommendations I got earlier
        withigdb = recommendations.merge(gameMappings, on='factorised', how='left')

        # Turn column into a list
        igdbids = withigdb['gameID'].tolist()

        dbConn.close()

        return JsonResponse(igdbids, safe=False)


class initialRatingsView(APIView):

    def post(self, request):
        user = request.data.get('user')
        ratings = request.data.get('ratings')

        user = User.objects.get(username = user)
        uidUser = userwithID.objects.get(user = user)

        print(uidUser.recID)
        print(ratings)

        for rating in ratings:

            print(uidUser.recID)
            print(rating['gameID'])
            print(rating['rating'])
            NewRatings.objects.create(
                userID = uidUser.recID,
                gameID = rating['gameID'],
                rating = rating['rating'],
            )
        return Response({'message':'New User Created'}, status=status.HTTP_201_CREATED)
    

class addRatingsView(APIView):

    def post(self, request):
        user = request.data.get('user')
        ratings = request.data.get('ratings')

        user = User.objects.get(username = user)
        uidUser = userwithID.objects.get(user = user)

        print(uidUser.recID)
        print(ratings)

        for rating in ratings:

            print(uidUser.recID)
            print(rating['gameID'])
            print(rating['rating'])
            NewRatings.objects.create(
                userID = uidUser.recID,
                gameID = rating['gameID'],
                rating = rating['rating'],
            )
        return Response({'message':'New User Created'}, status=status.HTTP_201_CREATED)