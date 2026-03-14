from django.contrib import admin
from .models import Tableau, PhotoRealisation

class PhotoRealisationInline(admin.TabularInline):
    model = PhotoRealisation
    extra = 3

@admin.register(Tableau)
class TableauAdmin(admin.ModelAdmin):
    list_display = ['titre', 'prix_unitaire', 'disponible', 'created_at']
    list_filter = ['disponible']
    search_fields = ['titre']
    inlines = [PhotoRealisationInline]