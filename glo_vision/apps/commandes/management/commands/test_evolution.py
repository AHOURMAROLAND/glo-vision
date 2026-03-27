#!/usr/bin/env python
"""
Commande Django pour tester Evolution API
Usage: python manage.py test_evolution
"""
from django.core.management.base import BaseCommand
from apps.whatsapp.bot_client import (
    bot_est_connecte, 
    envoyer_message, 
    envoyer_pdf,
    verifier_numero,
    statut_canaux
)
from apps.commandes.models import Commande
from apps.catalogue.models import Tableau
from apps.paiements.recu_generator import generer_recu_avance
import os


class Command(BaseCommand):
    help = 'Tester Evolution API et envoyer messages WhatsApp'

    def handle(self, *args, **options):
        self.stdout.write('[TEST] TEST WHAPI CLOUD')
        self.stdout.write('=' * 50)
        
        # 1. Vérifier configuration
        self.stdout.write('\n[CONFIG] Configuration:')
        evolution_url = os.getenv('EVOLUTION_API_URL', 'Non définie')
        evolution_key = os.getenv('EVOLUTION_API_KEY', 'Non définie')[:20] + '...' if os.getenv('EVOLUTION_API_KEY') else 'Non définie'
        self.stdout.write(f'  URL: {evolution_url}')
        self.stdout.write(f'  Clé: {evolution_key}')
        
        # 2. Tester connexion
        self.stdout.write('\n[CONNEXION] Test connexion:')
        try:
            connecte = bot_est_connecte()
            if connecte:
                self.stdout.write(self.style.SUCCESS('  [OK] Bot connecte !'))
            else:
                self.stdout.write(self.style.WARNING('  [WARN] Bot non connecte'))
                self.stdout.write('  [INFO] Cree l\'instance et scanne le QR code d\'abord')
                return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  [ERR] Erreur connexion: {e}'))
            return
        
        # 3. Vérifier numéro admin
        admin_numero = os.getenv('NUMERO_ADMIN_WHATSAPP', '22890940402')
        self.stdout.write(f'\n[NUMERO] Verification numero admin ({admin_numero}):')
        try:
            result = verifier_numero(admin_numero)
            if result.get('valid') and result.get('exists'):
                self.stdout.write(self.style.SUCCESS('  [OK] Numero valide sur WhatsApp'))
            else:
                self.stdout.write(self.style.WARNING('  [WARN] Numero non trouve ou invalide'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  [ERR] Erreur verification: {e}'))
        
        # 4. Envoyer message test
        self.stdout.write(f'\n[MESSAGE] Envoi message test a {admin_numero}:')
        try:
            message = '[TEST] Test Whapi Cloud - GLO Vision\n\nLe bot fonctionne correctement ! [OK]'
            result = envoyer_message(admin_numero, message)
            if result.get('success'):
                self.stdout.write(self.style.SUCCESS('  [OK] Message envoye !'))
                self.stdout.write(f'  [ID] ID: {result.get("id", "N/A")}')
            else:
                self.stdout.write(self.style.ERROR(f'  [ERR] Echec: {result.get("error", "Unknown")}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  [ERR] Erreur envoi: {e}'))
        
        # 5. Créer commande test et envoyer reçu
        self.stdout.write('\n[PDF] Test envoi PDF:')
        try:
            # Créer commande test
            tableau = Tableau.objects.first()
            if tableau:
                commande = Commande.objects.create(
                    tableau=tableau,
                    code='EVO-TEST',
                    nom_client='Test Evolution API',
                    numero_whatsapp='99809215',
                    nb_unites=1,
                    montant_total=50000,
                    montant_avance=25000,
                    montant_solde=25000,
                    statut='PAYEE_AVANCE'
                )
                
                # Générer reçu
                commande._type_recu = 'avance'
                pdf_buffer = generer_recu_avance(commande)
                
                # Envoyer PDF
                result = envoyer_pdf(
                    admin_numero,
                    pdf_buffer,
                    'recu_test_evolution.pdf',
                    caption='Recu de test depuis Whapi Cloud [PDF]',
                )
                
                if result.get('success'):
                    self.stdout.write(self.style.SUCCESS('  [OK] PDF envoye !'))
                else:
                    self.stdout.write(self.style.ERROR(f'  [ERR] Echec PDF: {result.get("error", "Unknown")}'))
                    
                # Nettoyer
                commande.delete()
            else:
                self.stdout.write(self.style.WARNING('  [WARN] Aucun tableau trouve pour test'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  [ERR] Erreur PDF: {e}'))
        
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.SUCCESS('[OK] TEST TERMINE !'))
        self.stdout.write('\n[INFO] Prochaines etapes:')
        self.stdout.write('1. Vérifie tes messages WhatsApp')
        self.stdout.write('2. Si erreur, vérifie que l\'instance est créée sur Render')
        self.stdout.write('3. Scanne le QR code si nécessaire')
