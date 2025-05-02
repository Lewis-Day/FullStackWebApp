from django.test import TestCase
from rest_framework.test import APITestCase
from .models import User, conversationModel, messageModel
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

# Create your tests here.


class createConversationTest(APITestCase):

    def setUp(self):
        self.u1 = User.objects.create_user(username="one", password="password")
        self.u2 = User.objects.create_user(username="two", password="password")

        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)


    def testCreation(self):

        url = '/api/createChat/'
        data = {'user1' : 'one', 'user2' : 'two'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(conversationModel.objects.filter(user1=self.u1, user2=self.u2).exists() or conversationModel.objects.filter(user1=self.u2, user2=self.u1).exists())

    
    def testAlreadyExists(self):

        conversationModel.objects.create(user1=self.u1, user2=self.u2)

        url = '/api/createChat/'
        data = {'user1' : 'one', 'user2' : 'two'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Chat already exists')


    def testUserDoesntExist(self):

        url = '/api/createChat/'
        data = {'user1' : 'three', 'user2' : 'two'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'No user with that username')


class addMessageTest(APITestCase):

    def setUp(self):
        self.u1 = User.objects.create_user(username="one", password="password")
        self.u2 = User.objects.create_user(username="two", password="password")

        self.conversation = conversationModel.objects.create(user1=self.u1, user2=self.u2)

        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)


    def testAddMessage(self):

        url = '/api/sendMessage/'
        data = {'user1' : 'one', 'user2' : 'two', 'message' : 'Test'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(messageModel.objects.filter(conversation = self.conversation).exists())

    def testUserDoesntExist(self):

        url = '/api/sendMessage/'
        data = {'user1' : 'three', 'user2' : 'two', 'message' : 'Test'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'No user with that username')


class getMessagesTest(APITestCase):

    def setUp(self):
        self.u1 = User.objects.create_user(username="one", password="password")
        self.u2 = User.objects.create_user(username="two", password="password")

        self.conversation = conversationModel.objects.create(user1=self.u1, user2=self.u2)
        self.message = messageModel.objects.create(
            conversation=self.conversation,
            sendingUser=self.u1,
            message='Test'
        )

        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

    def testUserDoesntExist(self):

        url = '/api/getMessages/' + "?user1=three&user2=two"

        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'No user with that username')

    
    def testMessageFetch(self):

        url = '/api/getMessages/' + "?user1=one&user2=two"

        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['message'], 'Test')


class getConversationsTest(APITestCase):

    def setUp(self):
        self.u1 = User.objects.create_user(username="one", password="password")
        self.u2 = User.objects.create_user(username="two", password="password")

        self.conversation = conversationModel.objects.create(user1=self.u1, user2=self.u2)

        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

    def testUserDoesntExist(self):

        url = '/api/getConversations/' + "?username=three"

        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'User not found')

    
    def testConversationFetch(self):

        url = '/api/getConversations/' + "?username=one"

        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [{'username' : 'two'}])


class deleteConversationTest(APITestCase):

    def setUp(self):
        self.u1 = User.objects.create_user(username="one", password="password")
        self.u2 = User.objects.create_user(username="two", password="password")

        self.conversation = conversationModel.objects.create(user1=self.u1, user2=self.u2)

        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)


    def testdelete(self):

        url = '/api/deleteChat/'
        data = {'user1' : 'one', 'user2' : 'two'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Chat deleted')
        self.assertFalse(conversationModel.objects.filter(user1=self.u1, user2=self.u2).exists() or conversationModel.objects.filter(user1=self.u2, user2=self.u1).exists())

    def testUserDoesntExist(self):

        url = '/api/deleteChat/'
        data = {'user1' : 'three', 'user2' : 'two'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'No user with that username')



class conversationNotFound(APITestCase):

    def setUp(self):
        self.u1 = User.objects.create_user(username="one", password="password")
        self.u2 = User.objects.create_user(username="two", password="password")

        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

    
    def testAddMessage(self):

        url = '/api/sendMessage/'
        data = {'user1' : 'one', 'user2' : 'two', 'message' : 'Test'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Conversation not found')


    def testGetMessages(self):

        url = '/api/getMessages/' + "?user1=one&user2=two"

        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Conversation not found')

    def testGetConversations(self):

        url = '/api/getConversations/' + "?username=one"

        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def testdeleteConversation(self):

        url = '/api/deleteChat/'
        data = {'user1' : 'one', 'user2' : 'two'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Conversation not found')
