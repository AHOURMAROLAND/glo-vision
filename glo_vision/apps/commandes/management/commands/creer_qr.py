#!/usr/bin/env python
import os
import django
from django.core.management.base import BaseCommand
from apps.commandes.models import Commande
from apps.catalogue.models import Tableau
from apps.qrcodes.models import QRCode
from django.utils import timezone
from datetime import timedelta
import uuid

class Command(BaseCommand):
    help = 'Créer un QR code pour une commande'

    def handle(self, *args, **options):
        self.stdout.write('📱 Création QR code...')
        
        # Récupérer tableau existant
        tableau = Tableau.objects.first()
        if not tableau:
            self.stdout.write(self.style.ERROR('❌ Aucun tableau trouvé'))
            return
        
        # Créer commande
        commande = Commande.objects.create(
            tableau=tableau,
            code='QR-DEMO',
            nom_client='Client QR Demo',
            numero_whatsapp='99809215',
            nb_unites=1,
            montant_total=50000,
            montant_avance=25000,
            montant_solde=25000,
            statut='PRETE'
        )
        
        # Créer QR code manuellement
        qr_code = QRCode.objects.create(
            commande=commande,
            token=uuid.uuid4(),
            expire_a=timezone.now() + timedelta(days=30),
            utilise=False
        )
        
        self.stdout.write(self.style.SUCCESS(f'✅ QR Code créé: {qr_code.token}'))
        self.stdout.write(f'📱 URL: http://localhost:5173/qr/{qr_code.token}')
        self.stdout.write(f'📦 Commande: {commande.code}')
        self.stdout.write(f'👤 Client: {commande.nom_client}')
        self.stdout.write(f'🎨 Tableau: {commande.tableau.titre}')
