from django.contrib import admin
from .models import Paiement

@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display = ['commande', 'type_paiement', 'montant', 'statut', 'created_at']
    list_filter = ['statut', 'type_paiement']
    readonly_fields = ['created_at']