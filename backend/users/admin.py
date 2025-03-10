from django.contrib import admin

from .models import userWithDOB, userwithID

# Register your models here.

admin.site.register(userWithDOB)
admin.site.register(userwithID)

class userwithID(admin.ModelAdmin):

    list_display, fields = ('user', 'recID')
    readonly_fields = ('user', )