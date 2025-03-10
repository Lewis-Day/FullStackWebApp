from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
import tensorflow as tf
import pandas as pd
import sqlite3
import requests
import numpy as np
import os
from users.models import userwithID

# Create your views here.

class recommendationsView(APIView):

    def get(self, request):

        # dbConn = sqlite3.connect('/Users/lewisday/Documents/University/Year 3/Project/FullStackWebApp/database/dataset.db')
        db_path = '/Users/lewisday/Documents/University/Year 3/Project/FullStackWebApp/database/dataset.db'
        if not os.path.exists(db_path):
            return JsonResponse({"error": "Database file not found"}, status=500)
        dbConn = sqlite3.connect(db_path)

        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        print("#######################################")

        user = request.user
        userid = userwithID.objects.get(user=user)
        id = userid.recID
        
        print("#######################################", id)


        # userToRecommend = int(input("Enter User ID to Recommend: "))

        # userToRecommend = int(2459)

        # userToRecommend = request.GET.get('userId', 2459)  # Default user if none provided
        userToRecommend = int(id)

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

        # # My credentials for the igdb database
        # id = 'ux7bv4lnw3boesl0tt1n1nyq3vgwgk'
        # secret = 'echnn45lnk1sogfwbsqtviup6okjzl'

        # # Get the token required for access to the data
        # def token():

        #     parameters = {
        #         'client_id' : id,
        #         'client_secret': secret,
        #         'grant_type' : 'client_credentials',
        #     }

        #     response = requests.post('https://id.twitch.tv/oauth2/token', data=parameters)
        #     response.raise_for_status()

        #     print(response.json())

        #     token = response.json()['access_token']
        #     return token


        # # Get the game name from the igdb based on the id
        # def getGameName(auth, id, gid):
        #     header = {
        #         'Client-ID' : id,
        #         'Authorization' : 'Bearer ' + auth,
        #     }

        #     query = 'fields name; where id = '+ str(gid) +';'


        #     response2 = requests.post(
        #         'https://api.igdb.com/v4/games',
        #         headers=header,
        #         data=query
        #     )
        #     response2.raise_for_status()

        #     gamesResponse = response2.json()
        #     for game in gamesResponse:

        #         gameName = game['name']
        #         return gameName


        # gettoken = token()

        # print("The games recommended are: ")

        # # For each igdb id get the name and print it out
        # for gid in igdbids:
        #     gameName = getGameName(gettoken, id, gid)
        #     print(gameName)


