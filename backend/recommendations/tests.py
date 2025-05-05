import datetime
from django.test import TestCase
from rest_framework.test import APITestCase
from .models import User, savedRecommendations
from users.models import userWithDOB, userwithID
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password

# Create your tests here.

# Used APITestCase from Django rest framework due to my tests requiring authentication

# Testing initialRatingsView
class initialRatingsTest(APITestCase):

    def setUp(self):

        self.user = User.objects.create(
        username ='test', 
        email = 'test@test.com',
        password = make_password('password'), 
        first_name = 'Test',
        last_name = 'User',
        )

        self.url = '/api/initialRatings/'

        self.dob = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.user, DOB=self.dob)

        userwithID.objects.create(user = self.user, recID=898130)

        response = RefreshToken.for_user(self.user)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    
    def testUserExists(self):

        data = {
            'user' : 'test',
            'ratings' : [
                {'gameID' : 1, 'rating' : '4'},
                {'gameID' : 2, 'rating' : '3'},

            ]
        }
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'New User Created')

    def testUserDoesntExist(self):

        data = {
            'user' : 'test100',
            'ratings' : [
                {'gameID' : 1, 'rating' : '4'},
                {'gameID' : 2, 'rating' : '3'},

            ]
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'User does not exist')


# Testing addRatingsView
class addRatingsTest(APITestCase):

    def setUp(self):

        self.user = User.objects.create(
        username ='test1', 
        email = 'test1@test.com',
        password = make_password('password'), 
        first_name = 'Test1',
        last_name = 'User',
        )

        self.url = '/api/addRatings/'

        self.dob = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.user, DOB=self.dob)

        userwithID.objects.create(user = self.user, recID=898130)

        response = RefreshToken.for_user(self.user)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    
    def testUserExists(self):

        data = {
            'ratings' : [
                {'gameID' : 1, 'rating' : '4'},
                {'gameID' : 2, 'rating' : '3'},

            ]
        }
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'New Ratings Added')


# Testing wildCardView
class wildCardTest(APITestCase):

    def setUp(self):

        self.user = User.objects.create(
        username ='test2', 
        email = 'test2@test.com',
        password = make_password('password'), 
        first_name = 'Test2',
        last_name = 'User',
        )

        self.dob = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.user, DOB=self.dob)

        userwithID.objects.create(user = self.user, recID=898131)

        response = RefreshToken.for_user(self.user)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    
    def testWildCard(self):

        url = '/api/wildcardRecommendation/'

        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('wildcard', response.data)


# Testing addSavedRecommendation
class addSavedRecommendationsTest(APITestCase):

    def setUp(self):

        self.user = User.objects.create(
        username ='test3', 
        email = 'test3@test.com',
        password = make_password('password'), 
        first_name = 'Test3',
        last_name = 'User',
        )

        self.url = '/api/saveRecommendation/'

        self.dob = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.user, DOB=self.dob)

        userwithID.objects.create(user = self.user, recID=898130)

        response = RefreshToken.for_user(self.user)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    
    def testReturnCorrectly(self):

        data = {
            'gameid' : 10,
            'name' : 'Call of Duty',
            'release' : '2010',
            'platforms' : 'Xbox 360, PlayStation 3'
        }
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'saved successfully')


# Testing getSavedRecommendation
class getSavedRecommendationsTest(APITestCase):

    def setUp(self):

        self.user = User.objects.create(
        username ='test4', 
        email = 'test4@test.com',
        password = make_password('password'), 
        first_name = 'Test4',
        last_name = 'User',
        )

        self.dob = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.user, DOB=self.dob)

        userwithID.objects.create(user = self.user, recID=898131)

        response = RefreshToken.for_user(self.user)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    
    def testGetSavedRecommendations(self):

        savedRecommendation = savedRecommendations.objects.create(
            user = self.user,
            gameid = 10,
            name = 'Call of Duty',
            release = '2010',
            platforms = 'Xbox 360, PlayStation 3',
        )

        url = '/api/getSavedRecommendation/'

        response = self.client.get(url, format='json')

        predicted = [{'id' : 10, 'name' : 'Call of Duty', 'release' : '2010', 'platforms' : 'Xbox 360, PlayStation 3'}]

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(predicted, response.data)

# Testing recommendationsView
class getRecommendationsTest(APITestCase):

    def setUp(self):

        self.user = User.objects.create(
        username ='test6', 
        email = 'test6@test.com',
        password = make_password('password'), 
        first_name = 'Test6',
        last_name = 'User',
        )

        self.dob = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.user, DOB=self.dob)

        userwithID.objects.create(user = self.user, recID=2459)

        response = RefreshToken.for_user(self.user)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    
    def testGetSavedRecommendations(self):

        url = '/api/recommendations/'

        response = self.client.get(url, format='json')

        predicted = [154839, 103032, 19089, 26611, 160072]

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('recommendations', response.data)
        self.assertIn('retrain', response.data)
        self.assertEqual(response.data['retrain'], False)
        self.assertEqual(len(response.data['recommendations']), 5)
        self.assertEqual(predicted, response.data['recommendations'])
