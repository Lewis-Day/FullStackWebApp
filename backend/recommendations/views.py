import random
from rest_framework.views import APIView
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
from .models import NewRatings, savedRecommendations
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from dotenv import load_dotenv


# Create your views here.

# The following annotations/decorators are used above views where user authentication is required
# These views are for pages which should be protected behind login - user must login to access them
# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])

# View for managing all types of recommendations (collaborative and content based used for cold start)
# Comments will be for each function to make it clearer to understand
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
class recommendationsView(APIView):

    # Function for getting the game predictions for a user (their recommendations based on the trained TensorFlow model)
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
        model = tf.keras.models.load_model('/home/lewisday/projects/tf/FullStackWebApp/FullStackWebApp/MLModels/evaluateModel2lessbatch.keras')

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
    

    # Function for getting my token to allow access to IGDB API
    # Gets my credentials from the env file in the frontend to send to an API to get the token
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
    
    # Function for getting the genres for a game from the IGDB API
    # Calls the API to get genre and if no genre is found 'No Genre' is returned
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
    

    # Function for managing the genres of games in the file and one hot encoding
    # Get token from token function

    # For each game given, get its genres
    # if genre is 'No Genre' then 'NoGenre' is used
    # For each genre given, if it doesn't already exist in file, add it

    # For each game, mark a 1 in the column for the genres applying for that game
    # Initialise new genre columns with zeros
    # Ensure file is updated accordingly with new data and add zeros where necessary to complete columns
    # Append changes to file and save
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


    # Function for managing the content-based filtering algorithm 
    # For each game provided, get it's cosine similarity by providing its genres
    # Sort the recommendations in descending order and remove ones for the game rated
    # Get the top five, create a list and if they are unique, add to set

    # Once all fetched, create a list from the set, randomly sample 5 from the selection
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

            

    # Function for managing the content-based filtering
    # If the game doesn't exist in the file, genres don't exist for that game and are required for recommendations
    # If thre are no genres to fetch, the content-based filering algorithm is called and recommendations returned
    # If there are genres to get, they are fetched first, then recommendations can be called and results returned
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
    

    # Function to check whether the user exists in the collaborative filtering database
    # Returns true/false whether the user exists or not (their id is in the database)
    def userExists(self, userToRecommend):

        db_path = os.path.abspath('/home/lewisday/projects/tf/FullStackWebApp/FullStackWebApp/database/dataset.db')
        dbConn = sqlite3.connect(db_path)
        userResults = pd.read_sql(f"SELECT COUNT(*) FROM ratings WHERE userId = ?", dbConn, params=(userToRecommend,))
        dbConn.close()

        if userResults.iloc[0, 0] != 0:
            return True
    
        else:
            return False

    # Function for fetching recommendations and managing logic
    def get(self, request):

        # Get the recommendation id (recID) of the user based on their entry in the user model
        user = request.user
        uidUser = userwithID.objects.get(user = user)
        uid = uidUser.recID
        print(user)
        print(uidUser)
        print(uid)

        # Variable to send to user to notify if they need to wait for collaborative recommendations due to retrain time
        retrain = False

        userToRecommend = uid

        # Find if the user exists in the collaborative database and if they do use collaborative filtering
        collabOrContent = self.userExists(userToRecommend)

        if(collabOrContent == True):
            recommendation = self.collaborativeFiltering(userToRecommend)

        # User does not exist in the collaborative filtering database
        else:

            # Find number of ratings the user has done to find out whether the collaborative filtering model needs to be retrained
            contentRatings = NewRatings.objects.filter(userID = userToRecommend).count()

            # If it is equal to 10, then set up for collaborative retraining is done here - time to retrain
            if contentRatings >= 10:
                factorisedFile = pd.read_csv("/home/lewisday/projects/tf/FullStackWebApp/FullStackWebApp/helperFiles/FactorisedtoGameID.csv")

                factorisedID = factorisedFile['factorised'].max() + 1
                gamesInFile = set(factorisedFile['gameID'])

                ratedGames = NewRatings.objects.filter(userID = userToRecommend).values_list('gameID', flat=True)

                newGames = []

                # Add any new game factorisations as the raw gameID from IGDB is not used
                for game in ratedGames:
                    if game not in gamesInFile:
                        newGames.append({'factorised' : factorisedID, 'gameID' : game})
                        factorisedID = factorisedID + 1
                
                # If there are new games to add
                if len(newGames) > 0:
                    # Add new game factorisations and their corresponding ID to file
                    additions = pd.DataFrame(newGames)
                    additions.to_csv("/home/lewisday/projects/tf/FullStackWebApp/FullStackWebApp/helperFiles/FactorisedtoGameID.csv", mode='a', header=False, index=False)

                    # Connect to database to add changes
                    db_path = os.path.abspath('/home/lewisday/projects/tf/FullStackWebApp/FullStackWebApp/database/dataset.db')
                    dbConn = sqlite3.connect(db_path)

                    factGameIDs = pd.read_csv("/home/lewisday/projects/tf/FullStackWebApp/FullStackWebApp/helperFiles/FactorisedtoGameID.csv")

                    # Get the user's games and ratings in respective lists
                    newUserRatedGames = NewRatings.objects.filter(userID = userToRecommend).values_list('gameID', flat=True)
                    newUserRatings = NewRatings.objects.filter(userID = userToRecommend).values_list('rating', flat=True)

                    # For each rating, factorise the 1-5 scale to a 0-1 scale for recommendations (what collaborative accepts)
                    for i in range(len(newUserRatedGames)):

                        newUserRatedGames[i] = factGameIDs.loc[factGameIDs['gameID'] == newUserRatedGames[i], 'factorised'].values[0]
                        newUserRatings[i] = (newUserRatings[i] - 1) / 4    

                    
                    # Get all user game pairs from database and stored in set - therfore unique
                    ratingsInDB = dbConn.execute('SELECT userId, gameIdFact from ratings')

                    uniqueEntries = set()

                    for row in ratingsInDB:
                        uniqueEntries.add((row[0], row[1]))


                    
                    ratingsToAdd = []

                    # If the user and game pair are unique, add them to a list to add to the database
                    # If they are not unique, don't add
                    for i in range(len(newUserRatedGames)):

                        if (newUserRatings[i], newUserRatedGames[i]) not in uniqueEntries:
                            ratingsToAdd.append((userToRecommend, newUserRatedGames[i], newUserRatings[i]))

                    # Use the database cursor to add values and use the list of tuples of (userid, gameid, rating)
                    cursor = dbConn.cursor()

                    cursor.executemany('INSERT INTO ratings (userId, gameIdFact, userRating) VALUES (?, ?, ?)', ratingsToAdd)

                    # Commit changes, close connection and signal that collaborative will need training
                    dbConn.commit()

                    dbConn.close()

                    retrain = True

            # Get user ratings by finding all games they rated and pass to content-based filering to generate recommendations
            userRatedGamesObject = NewRatings.objects.filter(userID = userToRecommend)
            userRatedGames = userRatedGamesObject.values_list('gameID', flat=True)
            recommendation = self.contentBasedFilteringBase(list(userRatedGames))

            print(recommendation)


        # Return the recommendations and whether retraining needs to be done so user can be notified
        return Response({'recommendations' : recommendation, 
                             'retrain' : retrain})
    


# View for allowing first time users to add their ratings
# Doesn't need auth because users are first time users
# Get the ratings passed from the frontend - list of game and rating pairs
# Also gets the user passed from the frontend as no auth
# Get the recommendation id from the userwithID model based on the user
# For each rating of a game given, create a new entry in the NewRatings model
class initialRatingsView(APIView):

    def post(self, request):
        user = request.data.get('user')
        ratings = request.data.get('ratings')

        try:
            user = User.objects.get(username = user)
            uidUser = userwithID.objects.get(user = user)
        
        except User.DoesNotExist:
            return Response({'error':'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
        

        for rating in ratings:
            NewRatings.objects.create(
                userID = uidUser.recID,
                gameID = rating['gameID'],
                rating = rating['rating'],
            )
        return Response({'message':'New User Created'}, status=status.HTTP_201_CREATED)
    
    
# View to allow users to add additonal game ratings
# Get the ratings passed from the frontend - list of game and rating pairs
# Get the recommendation id from the userwithID model based on the user
# For each rating of a game given, create a new entry in the NewRatings model
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
class addRatingsView(APIView):

    def post(self, request):
        
        user = request.user
        ratings = request.data.get('ratings')

        try:
            user = User.objects.get(username = user)
            uidUser = userwithID.objects.get(user = user)
        
        except User.DoesNotExist:
            return Response({'error':'User does not exist'}, status=status.HTTP_404_NOT_FOUND)

        for rating in ratings:

            NewRatings.objects.create(
                userID = uidUser.recID,
                gameID = rating['gameID'],
                rating = rating['rating'],
            )
        return Response({'message':'New Ratings Added'}, status=status.HTTP_201_CREATED)
    
# Model for getting a wildcard recommendation
# Read the CSV file of gameIDs 
# Randomly select one id from the list and return to the frontend
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
class wildCardView(APIView):

    def get(self, request):

        user = request.user

        gameIDFile = pd.read_csv("/home/lewisday/projects/tf/FullStackWebApp/FullStackWebApp/helperFiles/FactorisedtoGameID.csv")

        wildcard = random.choice(gameIDFile['gameID'].tolist())

        return Response({"wildcard" : wildcard}, status=status.HTTP_200_OK)
    

# View to add a recommendation that is saved by the user
# Get all data sent from the frontend in variables
# Create a new entry in the savedRecommendations model by adding all the required data
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
class addSavedRecommendation(APIView):

    def post(self, request):

        user = request.user
        gameid = request.data.get("gameid")
        name = request.data.get("name")
        release = request.data.get("release")
        platforms = request.data.get("platforms")


        savedRecommendation = savedRecommendations.objects.create(
            user = user,
            gameid = gameid,
            name = name,
            release = release,
            platforms = platforms,
        )
        return Response({"message" : "saved successfully"}, status = status.HTTP_201_CREATED)

        

    
# View for fetching the saved recommendations by the user
# Get the user and filter the savedRecommendations model to find entries by that user
# Append each entry by formatting the data in JSON format and return the whole list to the frontend
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
class getSavedRecommendation(APIView):

    def get(self, request):

        user = request.user

        userSaved = savedRecommendations.objects.filter(user = user)

        savedData = []
        for saved in userSaved:
            savedData.append(
                {
                    "id" : saved.gameid,
                    "name" : saved.name,
                    "release" : saved.release,
                    "platforms" : saved.platforms,

                }
            )
        
        return Response(savedData, status=status.HTTP_200_OK)


    
