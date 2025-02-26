from django.urls import path

from .views import userCreationView, loginView, fetchUsersView, changeUserDataView, changePasswordView

urlpatterns = [
    path('api/signup/', userCreationView.as_view(), name='signup'),
    path('api/login/', loginView.as_view(), name='login'),
    path('api/user/', fetchUsersView.as_view(), name='user'),
    path('api/updateUser/', changeUserDataView.as_view(), name='changeuser'),
    path('api/changePassword/', changePasswordView.as_view(), name='changePassword'),

]
