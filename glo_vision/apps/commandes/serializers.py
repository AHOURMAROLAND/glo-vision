from rest_framework import serializers
from .models import Commande, PhotoCommande
from apps.catalogue.serializers import TableauListSerializer

class PhotoCommandeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhotoCommande
        fields = ['id', 'image', 'nom_original', 'uploaded_at']

class CommandeCreateSerializer(serializers.ModelSerializer):
    photos = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True
    )

    class Meta:
        model = Commande
        fields = [
            'tableau',
            'nom_client',
            'numero_whatsapp',
            'nb_unites',
            'photos'
        ]

    def validate_nb_unites(self, value):
        if value < 1:
            raise serializers.ValidationError("Le nombre d'unités doit être au moins 1.")
        return value

    def create(self, validated_data):
        photos = validated_data.pop('photos')
        tableau = validated_data['tableau']
        nb_unites = validated_data['nb_unites']

        montant_total = tableau.prix_unitaire * nb_unites
        montant_avance = montant_total / 2
        montant_solde = montant_total - montant_avance

        commande = Commande.objects.create(
            **validated_data,
            montant_total=montant_total,
            montant_avance=montant_avance,
            montant_solde=montant_solde,
        )

        for photo in photos:
            PhotoCommande.objects.create(
                commande=commande,
                image=photo,
                nom_original=photo.name
            )

        return commande

class CommandeDetailSerializer(serializers.ModelSerializer):
    photos = PhotoCommandeSerializer(many=True, read_only=True)
    tableau = TableauListSerializer(read_only=True)
    statut_display = serializers.CharField(
        source='get_statut_display',
        read_only=True
    )

    class Meta:
        model = Commande
        fields = [
            'id', 'code', 'tableau', 'nom_client',
            'numero_whatsapp', 'nb_unites',
            'montant_total', 'montant_avance', 'montant_solde',
            'statut', 'statut_display', 'photos', 'created_at'
        ]