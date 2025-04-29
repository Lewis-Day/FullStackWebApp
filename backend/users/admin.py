from django.contrib import admin

from .models import userWithDOB, userwithID, userStatus, userFriends

# Register your models here.

# Registering userWithDOB, userwithID, userFriends and userStatus so they can be viewed in the admin panel
admin.site.register(userWithDOB)
admin.site.register(userwithID)
admin.site.register(userFriends)
admin.site.register(userStatus)

# Changing which fields can be edited for userwithID - the recID can be manually set in the admin panel
class userwithID(admin.ModelAdmin):

    list_display, fields = ('user', 'recID')
    readonly_fields = ('user', )