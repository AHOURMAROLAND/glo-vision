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
        self.stdout.write('🧪 Test simple du système...')
        
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
        
        self.stdout.write(f'✅ Commande {commande.code} créée')
        
        # Test reçu avance
        try:
            commande._type_recu = 'avance'
            pdf_buffer = generer_recu_avance(commande)
            with open(f'recu_avance_simple.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            self.stdout.write('✅ Reçu avance généré: recu_avance_simple.pdf')
        except Exception as e:
            self.stdout.write(f'❌ Erreur reçu avance: {e}')
        
        # Test reçu final
        try:
            pdf_buffer = generer_recu_final(commande)
            with open(f'recu_final_simple.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            self.stdout.write('✅ Reçu final généré: recu_final_simple.pdf')
        except Exception as e:
            self.stdout.write(f'❌ Erreur reçu final: {e}')
        
        # Test QR code
        commande.statut = Commande.Statut.PRETE
        commande.save()
        
        try:
            qr = commande.qrcode
            self.stdout.write(f'✅ QR Code: {qr.token}')
            self.stdout.write(f'📱 URL QR: http://localhost:5173/qr/{qr.token}')
        except Exception as e:
            self.stdout.write(f'❌ Erreur QR: {e}')
        
        self.stdout.write('🎯 Test terminé !')
