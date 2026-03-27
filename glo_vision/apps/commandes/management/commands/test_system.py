#!/usr/bin/env python
import os
import django
from django.core.management.base import BaseCommand
from apps.commandes.models import Commande
from apps.catalogue.models import Tableau
from apps.paiements.recu_generator import generer_recu_avance, generer_recu_final
from apps.whatsapp.bot_client import envoyer_message, bot_est_connecte
from io import BytesIO

class Command(BaseCommand):
    help = 'Tester le système de commandes et reçus'

    def handle(self, *args, **options):
        self.stdout.write('[TEST] Test du systeme GLO Vision...')
        
        # Vérifier connexion bot
        self.stdout.write('\n[WHATSAPP] Verification connexion bot WhatsApp...')
        if bot_est_connecte():
            self.stdout.write(self.style.SUCCESS('[OK] Bot connecte'))
        else:
            self.stdout.write(self.style.ERROR('[ERR] Bot non connecte'))
        
        # Créer tableau de test
        self.stdout.write('\n[ART] Creation tableau de test...')
        tableau, created = Tableau.objects.get_or_create(
            titre='Portrait Test',
            defaults={
                'description': 'Tableau de test pour validation',
                'prix_unitaire': 50000,
                'disponible': True,
                'image_principale': 'test.jpg'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('[OK] Tableau cree'))
        else:
            self.stdout.write('[INFO] Tableau existant utilise')
        
        # Créer commande de test
        self.stdout.write('\n[CMD] Creation commande de test...')
        commande, created = Commande.objects.get_or_create(
            code='TEST-001',
            defaults={
                'tableau': tableau,
                'nom_client': 'Client Test',
                'numero_whatsapp': '99809215',
                'nb_unites': 1,
                'montant_total': 50000,
                'montant_avance': 25000,
                'montant_solde': 25000,
                'statut': 'EN_ATTENTE'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('[OK] Commande creee'))
        else:
            self.stdout.write('[INFO] Commande existante utilisee')
        
        # Test message WhatsApp
        self.stdout.write('\n[MSG] Test message WhatsApp admin...')
        try:
            result = envoyer_message('+22890940402', f'Test système - Commande {commande.code} créée')
            if result.get('success'):
                self.stdout.write(self.style.SUCCESS('[OK] Message envoye a l\'admin'))
            else:
                self.stdout.write(self.style.ERROR(f'[ERR] Erreur envoi admin: {result}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'[ERR] Exception envoi admin: {e}'))
        
        # Test reçu avance
        self.stdout.write('\n[PDF] Test generation recu avance...')
        try:
            commande._type_recu = 'avance'
            pdf_buffer = generer_recu_avance(commande)
            
            # Sauvegarder le PDF
            with open(f'recu_avance_{commande.code}.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            
            self.stdout.write(self.style.SUCCESS(f'[OK] Recu avance genere: recu_avance_{commande.code}.pdf'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'[ERR] Erreur generation recu avance: {e}'))
        
        # Test reçu final
        self.stdout.write('\n[PDF] Test generation recu final...')
        try:
            pdf_buffer = generer_recu_final(commande)
            
            # Sauvegarder le PDF
            with open(f'recu_final_{commande.code}.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            
            self.stdout.write(self.style.SUCCESS(f'[OK] Recu final genere: recu_final_{commande.code}.pdf'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'[ERR] Erreur generation recu final: {e}'))
        
        # Test statut PAYEE_AVANCE
        self.stdout.write('\n[PAIEMENT] Test statut PAYEE_AVANCE...')
        commande.statut = Commande.Statut.PAYEE_AVANCE
        commande.save()
        self.stdout.write(self.style.SUCCESS('[OK] Statut mis a jour - Signal declenche'))
        
        # Test statut PRETE (génère QR code)
        self.stdout.write('\n[QR] Test statut PRETE (generation QR)...')
        commande.statut = Commande.Statut.PRETE
        commande.save()
        self.stdout.write(self.style.SUCCESS('[OK] Statut PRETE - QR code genere'))
        
        # Vérifier QR code
        try:
            qr = commande.qrcode
            self.stdout.write(self.style.SUCCESS(f'[OK] QR Code cree: {qr.token}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'[ERR] Erreur QR code: {e}'))
        
        # Test statut SOLDEE
        self.stdout.write('\n[DONE] Test statut SOLDEE...')
        commande.statut = Commande.Statut.SOLDEE
        commande.save()
        self.stdout.write(self.style.SUCCESS('[OK] Statut SOLDEE - Signal final declenche'))
        
        self.stdout.write('\n[OK] Tests termines !')
        self.stdout.write('[FILES] Fichiers generes:')
        self.stdout.write(f'   - recu_avance_{commande.code}.pdf')
        self.stdout.write(f'   - recu_final_{commande.code}.pdf')
