from rest_framework import serializers
from .models import Tableau, PhotoRealisation

class PhotoRealisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhotoRealisation
        fields = ['id', 'image', 'legende', 'ordre']

class TableauListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tableau
        fields = ['id', 'titre', 'description', 'prix_unitaire', 'image_principale', 'disponible']

class TableauDetailSerializer(serializers.ModelSerializer):
    realisations = PhotoRealisationSerializer(many=True, read_only=True)

    class Meta:
        model = Tableau
        fields = ['id', 'titre', 'description', 'prix_unitaire', 'image_principale', 'disponible', 'realisations']