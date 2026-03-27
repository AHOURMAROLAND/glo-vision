#!/usr/bin/env python
"""
Script pour générer un QR code WhatsApp manuellement
Utilisation: python generer_qr_whatsapp.py
"""
import qrcode
from PIL import Image

def generer_qr_whatsapp():
    """Génère un QR code avec le style GLO Vision"""
    
    # Données à encoder (URL du bot ou texte de test)
    data = "https://wa.me/22890940402?text=Test%20GLO%20Vision"
    
    # Créer le QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    # Générer l'image avec les couleurs GLO Vision
    img = qr.make_image(fill_color="#1A1A2E", back_color="#F5F0E8")
    
    # Sauvegarder
    output_file = "whatsapp-test-qr.png"
    img.save(output_file)
    
    print(f"✅ QR Code généré: {output_file}")
    print(f"📱 Scannez ce code pour tester WhatsApp")
    print(f"🔗 URL encodée: {data}")
    
    return output_file

if __name__ == "__main__":
    generer_qr_whatsapp()
