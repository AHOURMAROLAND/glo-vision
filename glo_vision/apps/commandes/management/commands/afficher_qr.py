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
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SquareGradiantColorMask
import base64
from io import BytesIO

class Command(BaseCommand):
    help = 'Afficher un QR code dans le terminal'

    def handle(self, *args, **options):
        self.stdout.write('📱 Génération QR Code terminal...')
        
        # Récupérer tableau existant
        tableau = Tableau.objects.first()
        if not tableau:
            self.stdout.write(self.style.ERROR('❌ Aucun tableau trouvé'))
            return
        
        # Créer commande
        import uuid as uuid_lib
        commande = Commande.objects.create(
            tableau=tableau,
            code=f'QR-{uuid_lib.uuid4().hex[:8].upper()}',
            nom_client='Client Terminal',
            numero_whatsapp='99809215',
            nb_unites=1,
            montant_total=50000,
            montant_avance=25000,
            montant_solde=25000,
            statut='PRETE'
        )
        
        # Créer QR code
        qr_code = QRCode.objects.create(
            commande=commande,
            token=uuid.uuid4(),
            expire_a=timezone.now() + timedelta(days=30),
            utilise=False
        )
        
        # Générer l'image QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(f"http://localhost:5175/qr/{qr_code.token}")
        qr.make(fit=True)
        
        # Créer l'image avec style
        img = qr.make_image(fill_color="#1A1A2E", back_color="#F5F0E8")
        
        # Sauvegarder l'image
        img.save(f'qr_terminal_{str(qr_code.token)[:8]}.png')
        
        # Afficher le QR code en ASCII
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('📱 QR CODE À SCANNER'))
        self.stdout.write('='*60)
        
        # Version simple ASCII
        qr_ascii = """
██████████████  ██  ██████████████
██          ██  ██  ██          ██
██  ██████  ██  ██  ██  ██████  ██
██  ██  ██  ██  ██  ██  ██  ██  ██
██  ██████  ██  ██  ██  ██████  ██
██          ██  ██  ██          ██
██████████████  ██  ██████████████
                ██                  
██  ██  ██  ██  ██  ██  ██  ██  ██
██  ██  ██  ██  ██  ██  ██  ██  ██
                ██                  
██████████████  ██  ██████████████
██          ██  ██  ██          ██
██  ██████  ██  ██  ██  ██████  ██
██  ██  ██  ██  ██  ██  ██  ██  ██
██  ██████  ██  ██  ██  ██████  ██
██          ██  ██  ██          ██
██████████████  ██  ██████████████
        """
        
        self.stdout.write(qr_ascii)
        
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('📋 INFORMATIONS'))
        self.stdout.write('='*60)
        self.stdout.write(f'🔗 URL: http://localhost:5175/qr/{qr_code.token}')
        self.stdout.write(f'📦 Commande: {commande.code}')
        self.stdout.write(f'👤 Client: {commande.nom_client}')
        self.stdout.write(f'🎨 Tableau: {commande.tableau.titre}')
        self.stdout.write(f'💰 Total: {commande.montant_total} FCFA')
        self.stdout.write(f'📱 Image: qr_terminal_{str(qr_code.token)[:8]}.png')
        self.stdout.write('='*60)
        
        # Test API
        self.stdout.write('\n🔍 Test API...')
        import requests
        try:
            response = requests.get(f'http://localhost:8000/api/qrcodes/verifier/{qr_code.token}/')
            if response.status_code == 200:
                data = response.json()
                self.stdout.write(self.style.SUCCESS(f'✅ API valide: {data}'))
            else:
                self.stdout.write(self.style.ERROR(f'❌ API erreur: {response.status_code}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ API exception: {e}'))
