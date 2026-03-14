from django.contrib import admin
from .models import QRCode

@admin.register(QRCode)
class QRCodeAdmin(admin.ModelAdmin):
    list_display = ['commande', 'utilise', 'expire_a', 'created_at']
    list_filter = ['utilise']
    readonly_fields = ['token', 'created_at']