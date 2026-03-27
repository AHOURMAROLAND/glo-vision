#!/usr/bin/env python
import os
import django
from django.core.management.base import BaseCommand
from apps.commandes.models import Commande
from apps.catalogue.models import Tableau
from apps.paiements.recu_generator import generer_recu_avance, generer_recu_final

class Command(BaseCommand):
    help = 'Test simple sans WhatsApp'

    def handle(self, *args, **options):
        self.stdout.write('[TEST] Test simple du systeme...')
        
        # Créer tableau de test
        tableau, created = Tableau.objects.get_or_create(
            titre='Portrait Test Simple',
            defaults={
                'description': 'Tableau de test simple',
                'prix_unitaire': 50000,
                'disponible': True,
                'image_principale': 'test.jpg'
            }
        )
        
        # Créer commande de test
        commande, created = Commande.objects.get_or_create(
            code='TEST-SIMPLE',
            defaults={
                'tableau': tableau,
                'nom_client': 'Client Test Simple',
                'numero_whatsapp': '99809215',
                'nb_unites': 1,
                'montant_total': 50000,
                'montant_avance': 25000,
                'montant_solde': 25000,
                'statut': 'EN_ATTENTE'
            }
        )
        
        self.stdout.write(f'[OK] Commande {commande.code} creee')
        
        # Test reçu avance
        try:
            commande._type_recu = 'avance'
            pdf_buffer = generer_recu_avance(commande)
            with open(f'recu_avance_simple.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            self.stdout.write('[OK] Recu avance genere: recu_avance_simple.pdf')
        except Exception as e:
            self.stdout.write(f'[ERR] Erreur recu avance: {e}')
        
        # Test reçu final
        try:
            pdf_buffer = generer_recu_final(commande)
            with open(f'recu_final_simple.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            self.stdout.write('[OK] Recu final genere: recu_final_simple.pdf')
        except Exception as e:
            self.stdout.write(f'[ERR] Erreur recu final: {e}')
        
        # Test QR code
        commande.statut = Commande.Statut.PRETE
        commande.save()
        
        try:
            qr = commande.qrcode
            self.stdout.write(f'[OK] QR Code: {qr.token}')
            self.stdout.write(f'[URL] URL QR: http://localhost:5173/qr/{qr.token}')
        except Exception as e:
            self.stdout.write(f'[ERR] Erreur QR: {e}')
        
        self.stdout.write('[OK] Test termine !')
