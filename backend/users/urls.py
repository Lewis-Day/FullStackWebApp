from django.urls import path

from .views import userCreationView, loginView, fetchUsersView, changeUserDataView, changePasswordView, forgotPasswordView, addFriendView, deleteFriend, acceptRequestView, declineFriendRequest, listFriendRequests, listFriends, listSentFriendRequests, deleteFriendRequest, logoutView, setUserStatus, getUserStatus

urlpatterns = [
    path('api/signup/', userCreationView.as_view(), name='signup'),
    path('api/login/', loginView.as_view(), name='login'),
    path('api/user/', fetchUsersView.as_view(), name='user'),
    path('api/logout/', logoutView.as_view(), name='logout'),
    path('api/updateUser/', changeUserDataView.as_view(), name='changeuser'),
    path('api/changePassword/', changePasswordView.as_view(), name='changePassword'),
    path('api/forgotPassword/', forgotPasswordView.as_view(), name='forgotPassword'),
    path('api/addFriend/', addFriendView.as_view(), name='addFriend'),
    path('api/deleteFriend/', deleteFriend.as_view(), name='deleteFriend'),
    path('api/deleteRequest/', deleteFriendRequest.as_view(), name='deleteRequest'),
    path('api/acceptRequest/', acceptRequestView.as_view(), name='acceptRequest'),
    path('api/declineRequest/', declineFriendRequest.as_view(), name='declineRequest'),
    path('api/getFriends/', listFriends.as_view(), name='getFriends'),
    path('api/getFriendRequests/', listFriendRequests.as_view(), name='getFriendRequests'),
    path('api/getSentFriendRequests/', listSentFriendRequests.as_view(), name='getSentFriendRequests'),
    path('api/setStatus/', setUserStatus.as_view(), name='setStatus'),
    path('api/getStatus/', getUserStatus.as_view(), name='getStatus'),
]
