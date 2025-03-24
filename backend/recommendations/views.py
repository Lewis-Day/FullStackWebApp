import random
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
import tensorflow as tf
from sklearn.metrics.pairwise import cosine_similarity
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
from dotenv import load_dotenv


# Create your views here.

@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
class recommendationsView(APIView):

    def collaborativeFiltering(self, userToRecommend):

        db_path = os.path.abspath('/home/lewisday/projects/tf/FullStackWebApp/FullStackWebApp/database/dataset.db')
        print(f"Using absolute path for database: {db_path}")
        if not os.path.exists(db_path):
            return JsonResponse({"error": "Database file not found"}, status=500)
        dbConn = sqlite3.connect(db_path)

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
        model = tf.keras.models.load_model('/home/lewisday/projects/tf/kerasModel.keras')

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
        gameMappings = pd.read_csv('/home/lewisday/projects/tf/FullStackWebApp/FullStackWebApp/helperFiles/FactorisedtoGameID.csv')

        # Merge with the recommendations I got earlier
        withigdb = recommendations.merge(gameMappings, on='factorised', how='left')

        # Turn column into a list
        igdbids = withigdb['gameID'].tolist()

        dbConn.close()

        return igdbids
    

    
    def token(self):

        load_dotenv(dotenv_path="../../frontend/.env.local")

        id = os.getenv("CLIENT_ID")
        print("id in token " + id)
        secret = os.getenv("SECRET")
        print("secret in token " + secret)

        parameters = {
            'client_id' : id,
            'client_secret': secret,
            'grant_type' : 'client_credentials',
        }

        response = requests.post('https://id.twitch.tv/oauth2/token', data=parameters)

        token = response.json()['access_token']
        return token
    

    def getGameGenres(self, auth, gid):

        id = os.getenv("CLIENT_ID")
        print("id in getGameGenres " + id)

        header = {
            'Client-ID' : id,
            'Authorization' : 'Bearer ' + auth,
        }
        query = 'fields genres; where id = '+ str(gid) +';'


        response2 = requests.post(
            'https://api.igdb.com/v4/games',
            headers=header,
            data=query
        )

        gamesResponse = response2.json()
        for game in gamesResponse:
            if game:
                if 'genres' not in game or not game['genres']:
                    return "No Genre"
                else:
                    return game['genres']
            else:
                return None
    

    
    def fetchExtraGenres(self, games):

        token = self.token()

        file = pd.read_csv('/home/lewisday/projects/tf/FullStackWebApp/FullStackWebApp/helperFiles/gameGenres.csv')

        currentGenres = set(file.columns[1:])
        newGames = []
        newGenres = set()

        for game in games:
            genres = self.getGameGenres(token, game)

            if genres == "No Genre":
                genres = ["NoGenre"]

            for genre in genres:

                g = str(genre)
                if g not in currentGenres:
                    newGenres.add(g)

                
            gameEntry = dict.fromkeys(file.columns, 0)
            gameEntry['gameID'] = game

            for genre in genres:
                g = str(genre)
                gameEntry[g] = 1
            
            newGames.append(gameEntry)

        if newGenres:
            for genre in newGenres:
                file[genre] = 0

        df = pd.DataFrame(newGames)

        for column in file.columns:
            if column not in df.columns:
                df[column] = 0

        appended = pd.concat([file, df], ignore_index=True)
        appended.to_csv('/home/lewisday/projects/tf/FullStackWebApp/FullStackWebApp/helperFiles/gameGenres.csv', index=False)



    def contentBasedAlgorithm(self, file, game):

        uniqueRecommendations = set()

        for g in game:
            genres = file.drop(columns=['gameID'])
            cs = cosine_similarity(genres)
            similarities = pd.DataFrame(cs, index=file['gameID'], columns=file['gameID'])
            print(similarities)
            gameColumn = similarities.loc[:, g]
            print(gameColumn)
            sorted = gameColumn.sort_values(ascending=False)
            notItself = sorted.drop([g])
            print(notItself.head(5))
            top5 = notItself.head(5)
            listTop5 = top5.index.to_list()

            for rec in listTop5:
                uniqueRecommendations.add(rec)

        
        listRecs = list(uniqueRecommendations)

        selection = random.sample(listRecs, 5)

        return selection

            

    
    def contentBasedFilteringBase(self, gameToRecommend):

        file = pd.read_csv('/home/lewisday/projects/tf/FullStackWebApp/FullStackWebApp/helperFiles/gameGenres.csv')

        genresToGet = []

        for games in gameToRecommend:
            if games not in file['gameID'].values:
                genresToGet.append(games)
        
        if len(genresToGet) != 0:
            self.fetchExtraGenres(genresToGet)
            fileNew = pd.read_csv('/home/lewisday/projects/tf/FullStackWebApp/FullStackWebApp/helperFiles/gameGenres.csv')
            recommendations = self.contentBasedAlgorithm(fileNew, gameToRecommend)

        else:
           recommendations = self.contentBasedAlgorithm(file, gameToRecommend)

        return recommendations
    

    
    def userExists(self, userToRecommend):

        db_path = os.path.abspath('/home/lewisday/projects/tf/FullStackWebApp/FullStackWebApp/database/dataset.db')
        dbConn = sqlite3.connect(db_path)
        userResults = pd.read_sql(f"SELECT COUNT(*) FROM ratings WHERE userId = ?", dbConn, params=(userToRecommend,))
        dbConn.close()

        if userResults.iloc[0, 0] != 0:
            return True
    
        else:
            return False


    def get(self, request):

        user = request.user
        uidUser = userwithID.objects.get(user = user)
        uid = uidUser.recID
        print(user)
        print(uidUser)
        print(uid)

        userToRecommend = uid

        collabOrContent = self.userExists(userToRecommend)

        if(collabOrContent == True):
            recommendation = self.collaborativeFiltering(userToRecommend)

        else:
            userRatedGamesObject = NewRatings.objects.filter(userID = userToRecommend)
            userRatedGames = userRatedGamesObject.values_list('gameID', flat=True)
            recommendation = self.contentBasedFilteringBase(list(userRatedGames))

        return JsonResponse(recommendation, safe=False)
    



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
    
    

@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
class addRatingsView(APIView):

    def post(self, request):
        
        user = request.user
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
    

