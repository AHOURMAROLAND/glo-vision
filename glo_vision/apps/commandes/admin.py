from django.contrib import admin
from .models import Commande, PhotoCommande

class PhotoCommandeInline(admin.TabularInline):
    model = PhotoCommande
    extra = 0
    readonly_fields = ['image', 'nom_original', 'uploaded_at']

@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom_client', 'numero_whatsapp', 'tableau', 'nb_unites', 'montant_total', 'statut', 'created_at']
    list_filter = ['statut']
    search_fields = ['code', 'nom_client', 'numero_whatsapp']
    readonly_fields = ['code', 'created_at', 'updated_at']
    inlines = [PhotoCommandeInline]
    list_editable = ['statut']