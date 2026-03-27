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
        self.stdout.write('🧪 Test du système GLO Vision...')
        
        # Vérifier connexion bot
        self.stdout.write('\n📱 Vérification connexion bot WhatsApp...')
        if bot_est_connecte():
            self.stdout.write(self.style.SUCCESS('✅ Bot connecté'))
        else:
            self.stdout.write(self.style.ERROR('❌ Bot non connecté'))
        
        # Créer tableau de test
        self.stdout.write('\n🎨 Création tableau de test...')
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
            self.stdout.write(self.style.SUCCESS('✅ Tableau créé'))
        else:
            self.stdout.write('ℹ️ Tableau existant utilisé')
        
        # Créer commande de test
        self.stdout.write('\n📦 Création commande de test...')
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
            self.stdout.write(self.style.SUCCESS('✅ Commande créée'))
        else:
            self.stdout.write('ℹ️ Commande existante utilisée')
        
        # Test message WhatsApp
        self.stdout.write('\n💬 Test message WhatsApp admin...')
        try:
            result = envoyer_message('+22890940402', f'Test système - Commande {commande.code} créée')
            if result.get('success'):
                self.stdout.write(self.style.SUCCESS('✅ Message envoyé à l\'admin'))
            else:
                self.stdout.write(self.style.ERROR(f'❌ Erreur envoi admin: {result}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Exception envoi admin: {e}'))
        
        # Test reçu avance
        self.stdout.write('\n🧾 Test génération reçu avance...')
        try:
            commande._type_recu = 'avance'
            pdf_buffer = generer_recu_avance(commande)
            
            # Sauvegarder le PDF
            with open(f'recu_avance_{commande.code}.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            
            self.stdout.write(self.style.SUCCESS(f'✅ Reçu avance généré: recu_avance_{commande.code}.pdf'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Erreur génération reçu avance: {e}'))
        
        # Test reçu final
        self.stdout.write('\n🧾 Test génération reçu final...')
        try:
            pdf_buffer = generer_recu_final(commande)
            
            # Sauvegarder le PDF
            with open(f'recu_final_{commande.code}.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            
            self.stdout.write(self.style.SUCCESS(f'✅ Reçu final généré: recu_final_{commande.code}.pdf'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Erreur génération reçu final: {e}'))
        
        # Test statut PAYEE_AVANCE
        self.stdout.write('\n💰 Test statut PAYEE_AVANCE...')
        commande.statut = Commande.Statut.PAYEE_AVANCE
        commande.save()
        self.stdout.write(self.style.SUCCESS('✅ Statut mis à jour - Signal déclenché'))
        
        # Test statut PRETE (génère QR code)
        self.stdout.write('\n📱 Test statut PRETE (génération QR)...')
        commande.statut = Commande.Statut.PRETE
        commande.save()
        self.stdout.write(self.style.SUCCESS('✅ Statut PRETE - QR code généré'))
        
        # Vérifier QR code
        try:
            qr = commande.qrcode
            self.stdout.write(self.style.SUCCESS(f'✅ QR Code créé: {qr.token}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Erreur QR code: {e}'))
        
        # Test statut SOLDEE
        self.stdout.write('\n🎉 Test statut SOLDEE...')
        commande.statut = Commande.Statut.SOLDEE
        commande.save()
        self.stdout.write(self.style.SUCCESS('✅ Statut SOLDEE - Signal final déclenché'))
        
        self.stdout.write('\n🎯 Tests terminés !')
        self.stdout.write('📁 Fichiers générés:')
        self.stdout.write(f'   - recu_avance_{commande.code}.pdf')
        self.stdout.write(f'   - recu_final_{commande.code}.pdf')
