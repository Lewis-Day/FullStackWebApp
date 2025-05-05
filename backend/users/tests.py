import datetime
from django.test import TestCase
from rest_framework.test import APITestCase
from .models import User, userWithDOB, userwithID, userFriends, FriendStatus, userStatus
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password

# Create your tests here.

# Used APITestCase from Django rest framework due to my tests requiring authentication

# Testing logoutView
class LogoutTest(TestCase):

    def test(self):
        url = '/api/logout/'
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

# Testing userCreationView
class UserCreateTest(APITestCase):

    def setUp(self):
        self.url = '/api/signup/'

        self.data = {
            'username' : 'test', 
            'email' : 'test@test.com',
            'password' : 'password', 
            'firstName' : 'Test',
            'lastName' : 'User', 
            'dob' : '2025-01-01'
        }
    
    def testMakeUser(self):
        response = self.client.post(self.url, self.data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='test').exists())
        user = User.objects.get(username='test')
        self.assertTrue(userWithDOB.objects.filter(user=user).exists())
        self.assertTrue(userwithID.objects.filter(user=user).exists())

    
    def testUsernameTaken(self):
        User.objects.create(
            username ='test', 
            email = 'test2@test.com',
            password = 'password', 
            first_name = 'Test2',
            last_name = 'User',
        )
        response = self.client.post(self.url, self.data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Username not available')

    
    def testEmailTaken(self):
        User.objects.create(
            username ='test3', 
            email = 'test@test.com',
            password = 'password', 
            first_name = 'Test3',
            last_name = 'User',
        )
        response = self.client.post(self.url, self.data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Email is used by another user')


# Testing loginView
class loginTest(APITestCase):
    def setUp(self):
        self.url = '/api/login/'

        self.user = User.objects.create(
            username ='test4', 
            email = 'test4@test.com',
            password = make_password('password'), 
            first_name = 'Test4',
            last_name = 'User',
        )
    
    def testchecklogin(self):
        data = {
            'username' : 'test4',
            'password' : 'password'
        }
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'User Authentication Successful')
        self.assertEqual(response.data['user'], 'test4')
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def testcheckloginbaddetails(self):
        data = {
            'username' : 'test10',
            'password' : 'password'
        }
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'User Authentication Unsuccessful')


# Testing fetchUsersView
class fetchUsersViewTest(APITestCase):
    def setUp(self):

        self.user = User.objects.create(
            username ='test5', 
            email = 'test5@test.com',
            password = make_password('password'), 
            first_name = 'Test5',
            last_name = 'User',
        )

        self.dob = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.user, DOB=self.dob)

        response = RefreshToken.for_user(self.user)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    
    def testUserExists(self):

        url = '/api/user/'+'?username=test5'
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'test5')
        self.assertEqual(response.data['email'], 'test5@test.com')
        self.assertEqual(response.data['first_name'], 'Test5')
        self.assertEqual(response.data['last_name'], 'User')
        self.assertEqual(response.data['dob'], '2025-01-01')

    def testUserDoesntExist(self):

        url = '/api/user/'+'?username=test100'
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'User does not exist')


# Testing changeUserDataView
class changeUserDataTest(APITestCase):
    def setUp(self):

        self.user = User.objects.create(
            username ='test6', 
            email = 'test6@test.com',
            password = make_password('password'), 
            first_name = 'Test6',
            last_name = 'User',
        )

        self.url = '/api/updateUser/'

        self.dob = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.user, DOB=self.dob)

        response = RefreshToken.for_user(self.user)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    
    def testUserExists(self):

        data = {
            'oldUname' : 'test6',
            'newdata' : {
                'username' : 'newtest6',
                'email' : 'newtest6@test.com', 
                'firstName' : 'Test6', 
                'lastName' : 'User', 
                'dob' : '2025-01-01'
            }}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'User Data Change Successful')

    def testUserDoesntExist(self):

        udata = {
            'oldUname' : 'test100',
            'newdata' : {
                'username' : 'test2',
                'email' : 'test@test.com', 
                'firstName' : 'Test2', 
                'lastName' : 'User', 
                'dob' : '2025-01-01'
            }}
        
        response = self.client.post(self.url, udata, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

# Testing changePasswordView
class changePasswordTest(APITestCase):
    def setUp(self):

        self.user = User.objects.create(
            username ='test7', 
            email = 'test7@test.com',
            password = make_password('password'), 
            first_name = 'Test7',
            last_name = 'User',
        )

        self.url = '/api/changePassword/'

        self.dob = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.user, DOB=self.dob)

        response = RefreshToken.for_user(self.user)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    
    def testUserExists(self):

        data = {

            'username' : 'test7',
            'password' : 'test123', 

        }
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Password Change Successful')

    def testUserDoesntExist(self):

        data = {

            'username' : 'test100',
            'password' : 'test123', 

        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

# Testing forgotPasswordView
class forgotPasswordTest(APITestCase):

    def setUp(self):

        self.user = User.objects.create(
            username ='test8', 
            email = 'test8@test.com',
            password = make_password('password'), 
            first_name = 'Test8',
            last_name = 'User',
        )

        self.url = '/api/forgotPassword/'

        self.dob = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.user, DOB=self.dob)
    
    def testUserExists(self):

        data = {

            'username' : 'test8',
            'email' : 'test8@test.com',
            'dob' : '2025-01-01',
            'password' : 'test123', 
        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Password Change Successful')

    def testemailWrong(self):

        data = {

            'username' : 'test8',
            'email' : 'test9@test.com',
            'dob' : '2025-01-01',
            'password' : 'test123', 
        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['error'], 'User Details Cannot be Matched')

    def testdobWrong(self):

        data = {

            'username' : 'test8',
            'email' : 'test9@test.com',
            'dob' : '2025-01-02',
            'password' : 'test123', 
        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['error'], 'User Details Cannot be Matched')

    def testUserDoesntExist(self):

        data = {

            'username' : 'test100',
            'email' : 'test8@test.com',
            'dob' : '2025-01-01',
            'password' : 'test123', 
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'User cannot be found, unsuccessful password change')



# Testing addFriendView
class addFriendTest(APITestCase):

    def setUp(self):

        self.u1 = User.objects.create(
            username ='test8', 
            email = 'test8@test.com',
            password = make_password('password'), 
            first_name = 'Test8',
            last_name = 'User',
        )

        self.u2 = User.objects.create(
            username ='test9', 
            email = 'test9@test.com',
            password = make_password('password'), 
            first_name = 'Test9',
            last_name = 'User',
        )

        self.url = '/api/addFriend/'

        self.dob1 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u1, DOB=self.dob1)

        self.dob2 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u2, DOB=self.dob2)


        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    
    def testUserExistsNoFriendship(self):

        data = {

            'username' : 'test9',
            'ownUsername' : 'test8',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Friend Request Sent')

    def testUserExistsFrienshipExists(self):

        friendModel = userFriends.objects.create(
            user1 = self.u2,
            user2 = self.u1,
            status = FriendStatus.ACCEPTED,
        )

        data = {

            'username' : 'test9',
            'ownUsername' : 'test8',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Friendship already exists')

    def testUserExistsFrienshipDeclined(self):

        friendModel = userFriends.objects.create(
            user1 = self.u2,
            user2 = self.u1,
            status = FriendStatus.DECLINED,
        )

        data = {

            'username' : 'test9',
            'ownUsername' : 'test8',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'New Friend Request Sent')


    def testUserFriendThemself(self):

        data = {

            'username' : 'test9',
            'ownUsername' : 'test9',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'Cannot friend yourself, error')

    def testUserDoesntExist(self):

        data = {

            'username' : 'test9',
            'ownUsername' : 'test1000',

        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'User not found')



# Testing acceptRequestView
class acceptFriendTest(APITestCase):

    def setUp(self):

        self.u1 = User.objects.create(
            username ='test10', 
            email = 'test10@test.com',
            password = make_password('password'), 
            first_name = 'Test10',
            last_name = 'User',
        )

        self.u2 = User.objects.create(
            username ='test11', 
            email = 'test11@test.com',
            password = make_password('password'), 
            first_name = 'Test11',
            last_name = 'User',
        )

        self.url = '/api/acceptRequest/'

        self.dob1 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u1, DOB=self.dob1)

        self.dob2 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u2, DOB=self.dob2)


        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    

    def testUserExistsFrienshipRequested(self):

        friendModel = userFriends.objects.create(
            user1 = self.u1,
            user2 = self.u2,
            status = FriendStatus.REQUESTED,
        )

        data = {

            'username' : 'test10',
            'ownUsername' : 'test11',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Friend Request Accepted')

    def testNoFriendRequestPending(self):

        data = {

            'username' : 'test10',
            'ownUsername' : 'test11',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'No Friend Request Pending')


    def testUserFriendThemself(self):

        data = {

            'username' : 'test10',
            'ownUsername' : 'test10',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'Cannot friend yourself, error')

    def testUserDoesntExist(self):

        data = {

            'username' : 'test10',
            'ownUsername' : 'test1000',

        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'User not found')

# Testing declineFriendRequest
class declineFriendTest(APITestCase):

    def setUp(self):

        self.u1 = User.objects.create(
            username ='test12', 
            email = 'test12@test.com',
            password = make_password('password'), 
            first_name = 'Test12',
            last_name = 'User',
        )

        self.u2 = User.objects.create(
            username ='test13', 
            email = 'test13@test.com',
            password = make_password('password'), 
            first_name = 'Test13',
            last_name = 'User',
        )

        self.url = '/api/declineRequest/'

        self.dob1 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u1, DOB=self.dob1)

        self.dob2 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u2, DOB=self.dob2)


        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    

    def testUserExistsFrienshipRequested(self):

        friendModel = userFriends.objects.create(
            user1 = self.u1,
            user2 = self.u2,
            status = FriendStatus.REQUESTED,
        )

        data = {

            'username' : 'test12',
            'ownUsername' : 'test13',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Friend Request Declined')

    def testNoFriendRequestPending(self):

        data = {

            'username' : 'test12',
            'ownUsername' : 'test13',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'No Friend Request Pending')


    def testUserFriendThemself(self):

        data = {

            'username' : 'test12',
            'ownUsername' : 'test12',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'Cannot friend yourself, error')

    def testUserDoesntExist(self):

        data = {

            'username' : 'test12',
            'ownUsername' : 'test1000',

        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'User not found')



# Testing deleteFriendRequest
class deleteFriendRequestTest(APITestCase):

    def setUp(self):

        self.u1 = User.objects.create(
            username ='test14', 
            email = 'test14@test.com',
            password = make_password('password'), 
            first_name = 'Test14',
            last_name = 'User',
        )

        self.u2 = User.objects.create(
            username ='test15', 
            email = 'test15@test.com',
            password = make_password('password'), 
            first_name = 'Test15',
            last_name = 'User',
        )

        self.url = '/api/deleteRequest/'

        self.dob1 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u1, DOB=self.dob1)

        self.dob2 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u2, DOB=self.dob2)


        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    

    def testUserExistsFrienshipRequested(self):

        friendModel = userFriends.objects.create(
            user1 = self.u2,
            user2 = self.u1,
            status = FriendStatus.REQUESTED,
        )

        data = {

            'username' : 'test14',
            'ownUsername' : 'test15',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Friend Request Deleted')
        self.assertFalse(userFriends.objects.filter(user1 = self.u1, user2 = self.u2, status = FriendStatus.REQUESTED).exists())

    def testNoFriendRequestPending(self):

        data = {

            'username' : 'test14',
            'ownUsername' : 'test15',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'No Friend Request Pending')


    def testUserFriendThemself(self):

        data = {

            'username' : 'test14',
            'ownUsername' : 'test14',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'Cannot friend yourself, error')

    def testUserDoesntExist(self):

        data = {

            'username' : 'test14',
            'ownUsername' : 'test1000',

        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'User not found')



# Testing deleteFriend
class deleteFriendTest(APITestCase):

    def setUp(self):

        self.u1 = User.objects.create(
            username ='test16', 
            email = 'test16@test.com',
            password = make_password('password'), 
            first_name = 'Test16',
            last_name = 'User',
        )

        self.u2 = User.objects.create(
            username ='test17', 
            email = 'test17@test.com',
            password = make_password('password'), 
            first_name = 'Test17',
            last_name = 'User',
        )

        self.url = '/api/deleteFriend/'

        self.dob1 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u1, DOB=self.dob1)

        self.dob2 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u2, DOB=self.dob2)


        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    

    def testUserExistsFrienship(self):

        friendModel = userFriends.objects.create(
            user1 = self.u2,
            user2 = self.u1,
            status = FriendStatus.ACCEPTED,
        )

        data = {

            'username' : 'test16',
            'ownUsername' : 'test17',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Friend Deleted')
        self.assertFalse(userFriends.objects.filter(user1 = self.u1, user2 = self.u2, status = FriendStatus.ACCEPTED).exists())

    def testNoFriendship(self):

        data = {

            'username' : 'test16',
            'ownUsername' : 'test17',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'No Friendship')


    def testUserFriendThemself(self):

        data = {

            'username' : 'test16',
            'ownUsername' : 'test16',

        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'Cannot friend yourself, error')

    def testUserDoesntExist(self):

        data = {

            'username' : 'test16',
            'ownUsername' : 'test1000',

        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'User not found')


# Testing listFriends
class listFriendsTest(APITestCase):
    def setUp(self):

        self.u1 = User.objects.create(
            username ='test18', 
            email = 'test18@test.com',
            password = make_password('password'), 
            first_name = 'Test18',
            last_name = 'User',
        )

        self.u2 = User.objects.create(
            username ='test19', 
            email = 'test19@test.com',
            password = make_password('password'), 
            first_name = 'Test19',
            last_name = 'User',
        )

        self.dob1 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u1, DOB=self.dob1)

        self.dob2 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u2, DOB=self.dob2)


        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    
    def testUserExistsHasFriends(self):

        friendModel = userFriends.objects.create(
            user1 = self.u2,
            user2 = self.u1,
            status = FriendStatus.ACCEPTED,
        )

        url = '/api/getFriends/'+'?username=test18'
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [{'username':'test19'}])

    def testUserExistsNoFriends(self):

        url = '/api/getFriends/'+'?username=test18'
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def testUserDoesntExist(self):

        url = '/api/getFriends/'+'?username=test100'
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'User not found')


# Testing listFriendRequests
class listFriendsRequestedTest(APITestCase):
    def setUp(self):

        self.u1 = User.objects.create(
            username ='test20', 
            email = 'test20@test.com',
            password = make_password('password'), 
            first_name = 'Test20',
            last_name = 'User',
        )

        self.u2 = User.objects.create(
            username ='test21', 
            email = 'test21@test.com',
            password = make_password('password'), 
            first_name = 'Test21',
            last_name = 'User',
        )

        self.dob1 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u1, DOB=self.dob1)

        self.dob2 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u2, DOB=self.dob2)


        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    
    def testUserExistsHasFriends(self):

        friendModel = userFriends.objects.create(
            user1 = self.u2,
            user2 = self.u1,
            status = FriendStatus.REQUESTED,
        )

        url = '/api/getFriendRequests/'+'?username=test20'
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [{'username':'test21'}])
    
    def testUserExistsNoFriends(self):

        url = '/api/getFriendRequests/'+'?username=test20'
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def testUserDoesntExist(self):

        url = '/api/getFriendRequests/'+'?username=test100'
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'User not found')

# Testing listSentFriendRequests
class listFriendsRequestedSentTest(APITestCase):
    def setUp(self):

        self.u1 = User.objects.create(
            username ='test22', 
            email = 'test22@test.com',
            password = make_password('password'), 
            first_name = 'Test22',
            last_name = 'User',
        )

        self.u2 = User.objects.create(
            username ='test23', 
            email = 'test23@test.com',
            password = make_password('password'), 
            first_name = 'Test23',
            last_name = 'User',
        )

        self.dob1 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u1, DOB=self.dob1)

        self.dob2 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u2, DOB=self.dob2)


        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    
    def testUserExistsHasFriends(self):

        friendModel = userFriends.objects.create(
            user1 = self.u1,
            user2 = self.u2,
            status = FriendStatus.REQUESTED,
        )

        url = '/api/getSentFriendRequests/'+'?username=test22'
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [{'username':'test23'}])
    
    def testUserExistsNoFriends(self):

        url = '/api/getSentFriendRequests/'+'?username=test22'
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def testUserDoesntExist(self):

        url = '/api/getSentFriendRequests/'+'?username=test100'
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'User not found')


# Testing setUserStatus
class setUserStatusTest(APITestCase):

    def setUp(self):

        self.u1 = User.objects.create(
            username ='test24', 
            email = 'test24@test.com',
            password = make_password('password'), 
            first_name = 'Test24',
            last_name = 'User',
        )

        self.url = '/api/setStatus/'

        self.dob1 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u1, DOB=self.dob1)

        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

    def testaddStatus(self):

        data = {
            'username' : 'test24',
            'game' : 'Valorant',
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'success')
        self.assertTrue(userStatus.objects.filter(user=self.u1).exists())

    def testChangeStatus(self):

        userStatus.objects.create(user=self.u1, status='Valorant')

        data = {
            'username' : 'test24',
            'game' : 'Call of Duty Black Ops 6',
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'success')
        gameStatus = userStatus.objects.get(user=self.u1)
        self.assertEqual(gameStatus.status, 'Call of Duty Black Ops 6')


    def testUserDoesntExist(self):

        data = {
            'username' : 'test100',
            'game' : 'Valorant',
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'User not found')


# Testing getUserStatus
class getStatusTest(APITestCase):
    def setUp(self):

        self.u1 = User.objects.create(
            username ='test25', 
            email = 'test25@test.com',
            password = make_password('password'), 
            first_name = 'Test25',
            last_name = 'User',
        )

        self.dob1 = datetime.date(2025, 1, 1)
        userWithDOB.objects.create(user = self.u1, DOB=self.dob1)

        response = RefreshToken.for_user(self.u1)
        self.token = str(response.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
    
    def testUserExistsWithStatus(self):

        userStatus.objects.create(user=self.u1, status='Valorant')

        url = '/api/getStatus/'+'?username=test25'
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'status':'Valorant'})
    
    def testUserNoStatus(self):

        url = '/api/getStatus/'+'?username=test25'
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'status':''})

    def testUserDoesntExist(self):

        url = '/api/getStatus/'+'?username=test100'
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'User not found')