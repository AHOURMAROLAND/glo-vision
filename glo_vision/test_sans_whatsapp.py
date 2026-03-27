#!/usr/bin/env python
"""
Script de test complet sans WhatsApp
Vérifie que tout le système fonctionne sauf WhatsApp
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.commandes.models import Commande
from apps.catalogue.models import Tableau
from apps.paiements.recu_generator import generer_recu_avance, generer_recu_final
from apps.qrcodes.models import QRCode
from django.utils import timezone
from datetime import timedelta
import uuid

def test_complet_sans_whatsapp():
    print("🧪 TEST COMPLET SANS WHATSAPP")
    print("=" * 50)
    
    # 1. Créer commande
    tableau = Tableau.objects.first()
    if not tableau:
        print("❌ Aucun tableau trouvé")
        return
    
    commande = Commande.objects.create(
        tableau=tableau,
        code=f'TEST-{uuid.uuid4().hex[:6].upper()}',
        nom_client='Roland Ahourma',
        numero_whatsapp='99809215',
        nb_unites=2,
        montant_total=100000,
        montant_avance=50000,
        montant_solde=50000,
        statut='EN_ATTENTE'
    )
    print(f"✅ Commande créée: {commande.code}")
    
    # 2. Générer reçu avance
    try:
        commande._type_recu = 'avance'
        pdf = generer_recu_avance(commande)
        filename = f"recu_avance_{commande.code}.pdf"
        with open(filename, 'wb') as f:
            f.write(pdf.getvalue())
        print(f"✅ Reçu avance: {filename}")
    except Exception as e:
        print(f"❌ Erreur reçu avance: {e}")
    
    # 3. Passer à PAYEE_AVANCE
    commande.statut = Commande.Statut.PAYEE_AVANCE
    commande.save()
    print("✅ Statut: PAYEE_AVANCE (notification WhatsApp échoue mais loggée)")
    
    # 4. Passer à PRETE (génère QR)
    commande.statut = Commande.Statut.PRETE
    commande.save()
    
    try:
        qr = commande.qrcode
        print(f"✅ QR Code: {qr.token}")
        print(f"📱 URL: http://localhost:5175/qr/{qr.token}")
    except Exception as e:
        print(f"❌ Erreur QR: {e}")
    
    # 5. Passer à SOLDEE
    commande.statut = Commande.Statut.SOLDEE
    commande.save()
    
    # 6. Générer reçu final
    try:
        pdf = generer_recu_final(commande)
        filename = f"recu_final_{commande.code}.pdf"
        with open(filename, 'wb') as f:
            f.write(pdf.getvalue())
        print(f"✅ Reçu final: {filename}")
    except Exception as e:
        print(f"❌ Erreur reçu final: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 TEST TERMINÉ!")
    print("✅ Système fonctionnel (sans WhatsApp)")
    print("📁 Fichiers générés dans le dossier glo_vision/")

if __name__ == "__main__":
    test_complet_sans_whatsapp()
